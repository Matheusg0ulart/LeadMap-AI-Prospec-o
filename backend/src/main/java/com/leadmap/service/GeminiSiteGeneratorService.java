package com.leadmap.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadmap.dto.SiteDemoDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeminiSiteGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(GeminiSiteGeneratorService.class);

    @Value("${app.ai.gemini-api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini-model:gemini-1.5-flash}")
    private String geminiModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;
    private final Map<String, SiteDemoDto> cache = new ConcurrentHashMap<>();

    public GeminiSiteGeneratorService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(4))
                .build();
    }

    public boolean isGeminiConfigured() {
        return geminiApiKey != null && !geminiApiKey.trim().isEmpty() && !geminiApiKey.equalsIgnoreCase("none");
    }

    public SiteDemoDto generateWithGemini(Long businessId, String businessName, String category,
                                          String address, String phone, Double rating, Integer reviews,
                                          String neighborhood) {
        if (!isGeminiConfigured()) {
            return null;
        }

        String cacheKey = (businessId != null ? "id_" + businessId : "name_" + businessName.toLowerCase().trim());
        if (cache.containsKey(cacheKey)) {
            return cache.get(cacheKey);
        }

        try {
            String prompt = buildPrompt(businessName, category, address, phone, rating, reviews, neighborhood);

            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    ),
                    "generationConfig", Map.of(
                            "responseMimeType", "application/json",
                            "temperature", 0.7
                    )
            ));

            String cleanModel = (geminiModel != null && !geminiModel.isBlank()) ? geminiModel.trim() : "gemini-1.5-flash";
            String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + cleanModel + ":generateContent?key=" + geminiApiKey.trim();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(5))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                if (!textNode.isMissingNode()) {
                    String generatedJson = textNode.asText();
                    SiteDemoDto dto = parseGeminiJson(generatedJson);
                    if (dto != null) {
                        dto.setAiPowered(true);
                        cache.put(cacheKey, dto);
                        log.info("Gemini AI gerou com sucesso o site para: {}", businessName);
                        return dto;
                    }
                }
            } else {
                log.warn("Gemini API retornou status {} - {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Falha ao chamar Gemini API para {}: {}", businessName, e.getMessage());
        }

        return null; // Graceful fallback
    }

    private String buildPrompt(String name, String category, String address, String phone,
                               Double rating, Integer reviews, String neighborhood) {
        return "Você é um mestre em copywriting e Web Design para comércios locais brasileiros.\n" +
                "Crie uma estrutura completa de site de altíssima conversão e visual deslumbrante para este cliente:\n" +
                "- Nome: " + name + "\n" +
                "- Categoria / Nicho: " + category + "\n" +
                "- Bairro / Localização: " + neighborhood + "\n" +
                "- Endereço Completo: " + address + "\n" +
                "- Nota Google: " + (rating != null ? rating : 4.9) + " (" + (reviews != null ? reviews : 48) + " avaliações)\n" +
                "- Telefone / WhatsApp: " + phone + "\n\n" +
                "Retorne RIGOROSAMENTE apenas um objeto JSON com o seguinte formato:\n" +
                "{\n" +
                "  \"headline\": \"Título de impacto focado no cliente e na região\",\n" +
                "  \"subheadline\": \"Subtítulo convincente que valoriza o comércio e desperta confiança\",\n" +
                "  \"slogan\": \"Slogan curto e marcante\",\n" +
                "  \"primaryCta\": \"Texto do botão WhatsApp (ex: Agendar pelo WhatsApp, Fazer Pedido Agora, Solicitar Orçamento)\",\n" +
                "  \"theme\": \"um dos seguintes: 'emerald', 'gold-dark', 'amber', 'blue', 'slate', 'purple', 'crimson', 'indigo'\",\n" +
                "  \"primaryColor\": \"#corHexPrimária\",\n" +
                "  \"accentColor\": \"#corHexDestaque\",\n" +
                "  \"heroImageUrl\": \"URL direta do Unsplash com foto profissional de alta qualidade adequada ao nicho\",\n" +
                "  \"galleryImages\": [\"url_unsplash_1\", \"url_unsplash_2\", \"url_unsplash_3\"],\n" +
                "  \"aboutTitle\": \"Título humanizado da seção Quem Somos\",\n" +
                "  \"aboutText\": \"Texto envolvente contando a dedicação da empresa e atendimento em " + neighborhood + "\",\n" +
                "  \"businessHours\": \"Horário de funcionamento detalhado e realista\",\n" +
                "  \"services\": [\n" +
                "    { \"title\": \"Nome do Serviço/Produto\", \"description\": \"Descrição atrativa\", \"icon\": \"star|shield|check-circle|sparkles|heart|truck|scissors|utensils\", \"tag\": \"Mais Procurado|Destaque|Exclusivo\", \"priceBadge\": \"A partir de R$ XX\" }\n" +
                "  ],\n" +
                "  \"pillars\": [\n" +
                "    { \"title\": \"Diferencial 1\", \"description\": \"Por que somos os melhores\", \"icon\": \"star|shield|award|clock|check-circle\" }\n" +
                "  ],\n" +
                "  \"highlights\": [\"Destaque 1 com estrelas\", \"Destaque 2 com garantia\", \"Destaque 3 de comodidade\"],\n" +
                "  \"testimonials\": [\n" +
                "    { \"author\": \"Nome do Cliente\", \"comment\": \"Depoimento realista e entusiasmado\", \"rating\": 5, \"timeAgo\": \"há 1 semana\" }\n" +
                "  ],\n" +
                "  \"faqs\": [\n" +
                "    { \"question\": \"Pergunta frequente 1\", \"answer\": \"Resposta clara e acolhedora\" }\n" +
                "  ]\n" +
                "}\n" +
                "Gere 4 serviços, 4 diferenciais (pillars), 3 destaques (highlights), 3 depoimentos (testimonials) e 3 FAQs.";
    }

    private SiteDemoDto parseGeminiJson(String json) {
        try {
            JsonNode node = objectMapper.readTree(json);
            SiteDemoDto demo = new SiteDemoDto();
            demo.setHeadline(node.path("headline").asText(null));
            demo.setSubheadline(node.path("subheadline").asText(null));
            demo.setSlogan(node.path("slogan").asText(null));
            demo.setPrimaryCta(node.path("primaryCta").asText("Falar no WhatsApp"));
            demo.setTheme(node.path("theme").asText("indigo"));
            demo.setPrimaryColor(node.path("primaryColor").asText("#4f46e5"));
            demo.setAccentColor(node.path("accentColor").asText("#6366f1"));
            demo.setHeroImageUrl(node.path("heroImageUrl").asText(null));
            demo.setAboutTitle(node.path("aboutTitle").asText(null));
            demo.setAboutText(node.path("aboutText").asText(null));
            demo.setBusinessHours(node.path("businessHours").asText(null));

            // Gallery
            if (node.has("galleryImages") && node.path("galleryImages").isArray()) {
                List<String> gallery = new ArrayList<>();
                for (JsonNode img : node.path("galleryImages")) {
                    gallery.add(img.asText());
                }
                demo.setGalleryImages(gallery);
            }

            // Highlights
            if (node.has("highlights") && node.path("highlights").isArray()) {
                List<String> highlights = new ArrayList<>();
                for (JsonNode h : node.path("highlights")) {
                    highlights.add(h.asText());
                }
                demo.setHighlights(highlights);
            }

            // Services
            if (node.has("services") && node.path("services").isArray()) {
                List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
                for (JsonNode s : node.path("services")) {
                    services.add(new SiteDemoDto.ServiceItemDto(
                            s.path("title").asText("Serviço Especializado"),
                            s.path("description").asText("Atendimento com máxima excelência."),
                            s.path("icon").asText("star"),
                            s.path("tag").asText(null),
                            s.path("priceBadge").asText(null)
                    ));
                }
                demo.setServices(services);
            }

            // Pillars
            if (node.has("pillars") && node.path("pillars").isArray()) {
                List<SiteDemoDto.PillarDto> pillars = new ArrayList<>();
                for (JsonNode p : node.path("pillars")) {
                    pillars.add(new SiteDemoDto.PillarDto(
                            p.path("title").asText("Qualidade Garantida"),
                            p.path("description").asText("Trabalhamos com os melhores padrões."),
                            p.path("icon").asText("check-circle")
                    ));
                }
                demo.setPillars(pillars);
            }

            // Testimonials
            if (node.has("testimonials") && node.path("testimonials").isArray()) {
                List<SiteDemoDto.TestimonialDto> testimonials = new ArrayList<>();
                for (JsonNode t : node.path("testimonials")) {
                    testimonials.add(new SiteDemoDto.TestimonialDto(
                            t.path("author").asText("Cliente Satisfeito"),
                            t.path("comment").asText("Serviço excepcional, recomendo a todos!"),
                            t.path("rating").asInt(5),
                            t.path("timeAgo").asText("recente")
                    ));
                }
                demo.setTestimonials(testimonials);
            }

            // FAQs
            if (node.has("faqs") && node.path("faqs").isArray()) {
                List<SiteDemoDto.FaqDto> faqs = new ArrayList<>();
                for (JsonNode f : node.path("faqs")) {
                    faqs.add(new SiteDemoDto.FaqDto(
                            f.path("question").asText(),
                            f.path("answer").asText()
                    ));
                }
                demo.setFaqs(faqs);
            }

            return demo;
        } catch (Exception e) {
            log.warn("Erro ao fazer parse do JSON do Gemini: {}", e.getMessage());
            return null;
        }
    }
}

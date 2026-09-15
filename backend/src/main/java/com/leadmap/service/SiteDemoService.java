package com.leadmap.service;

import com.leadmap.dto.BusinessDto;
import com.leadmap.dto.SiteDemoDto;
import com.leadmap.entity.Business;
import com.leadmap.exception.ResourceNotFoundException;
import com.leadmap.repository.BusinessRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class SiteDemoService {

    private final BusinessRepository businessRepository;
    private final WhatsAppPitchService whatsAppPitchService;
    private final DomainCheckService domainCheckService;
    private final GeminiSiteGeneratorService geminiSiteGeneratorService;

    public SiteDemoService(BusinessRepository businessRepository,
                           WhatsAppPitchService whatsAppPitchService,
                           DomainCheckService domainCheckService,
                           GeminiSiteGeneratorService geminiSiteGeneratorService) {
        this.businessRepository = businessRepository;
        this.whatsAppPitchService = whatsAppPitchService;
        this.domainCheckService = domainCheckService;
        this.geminiSiteGeneratorService = geminiSiteGeneratorService;
    }

    @Transactional(readOnly = true)
    public SiteDemoDto generateDemoForBusinessId(Long businessId, String baseUrl) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Estabelecimento não encontrado com ID: " + businessId));

        String suggestedDomain = domainCheckService.suggestDomain(business.getName());
        Boolean domainAvailable = (business.getWebsite() == null || business.getWebsite().isBlank())
                ? domainCheckService.checkAvailability(suggestedDomain)
                : false;

        return buildSiteDemo(
                business.getId(),
                business.getName(),
                business.getCategory(),
                business.getAddress(),
                business.getPhone(),
                business.getRating(),
                business.getReviewCount(),
                business.getInstagram(),
                suggestedDomain,
                domainAvailable,
                baseUrl
        );
    }

    public SiteDemoDto generateDemoFromDto(BusinessDto dto, String baseUrl) {
        return buildSiteDemo(
                dto.getId(),
                dto.getName(),
                dto.getCategory(),
                dto.getAddress(),
                dto.getPhone(),
                dto.getRating(),
                dto.getReviewCount(),
                dto.getInstagram(),
                dto.getSuggestedDomain(),
                dto.getDomainAvailable(),
                baseUrl
        );
    }

    public SiteDemoDto buildSiteDemo(Long id, String rawName, String rawCategory, String address,
                                     String phone, Double rating, Integer reviews, String instagram,
                                     String suggestedDomain, Boolean domainAvailable, String baseUrl) {
        String name = (rawName != null && !rawName.isBlank()) ? rawName.trim() : "Seu Negócio";
        String category = (rawCategory != null && !rawCategory.isBlank()) ? rawCategory.trim() : "Comércio Local";
        double stars = rating != null ? rating : 4.9;
        int reviewTotal = reviews != null && reviews > 0 ? reviews : 56;
        String cleanPhone = whatsAppPitchService.sanitizePhoneForWhatsApp(phone);

        // Define location string
        String neighborhood = "sua região";
        if (address != null && address.contains("-")) {
            String[] parts = address.split("-");
            if (parts.length > 1) {
                neighborhood = parts[1].trim().split(",")[0].trim();
            }
        }

        SiteDemoDto demo = new SiteDemoDto();
        demo.setBusinessId(id);
        demo.setBusinessName(name);
        demo.setCategory(category);
        demo.setAddress(address != null ? address : "São Paulo - SP");
        demo.setPhone(phone != null ? phone : "(11) 99999-0000");
        demo.setWhatsappNumber(cleanPhone);
        demo.setRating(stars);
        demo.setReviewCount(reviewTotal);
        demo.setInstagram(instagram);
        demo.setSuggestedDomain(suggestedDomain);
        demo.setDomainAvailable(domainAvailable);

        String appBaseUrl = (baseUrl != null && !baseUrl.isBlank()) ? baseUrl : "http://localhost:4200";
        if (appBaseUrl.endsWith("/")) {
            appBaseUrl = appBaseUrl.substring(0, appBaseUrl.length() - 1);
        }
        String demoUrl = (id != null && id > 0)
                ? appBaseUrl + "/demo/" + id
                : appBaseUrl + "/demo?name=" + URLEncoder.encode(name, StandardCharsets.UTF_8);
        demo.setDemoUrl(demoUrl);

        // 1. Tenta gerar conteúdo hiper-personalizado com Google Gemini AI
        SiteDemoDto geminiResult = geminiSiteGeneratorService.generateWithGemini(
                id, name, category, address, phone, stars, reviewTotal, neighborhood
        );

        if (geminiResult != null) {
            applyGeminiResult(demo, geminiResult, category);
        } else {
            // 2. Fallback de alta fidelidade com visual moderno e imagens em alta definição
            applyCategoryTemplate(demo, name, category, neighborhood, stars, reviewTotal);
        }

        // Generate sales pitch including the demo link
        StringBuilder pitch = new StringBuilder();
        pitch.append("Olá! Tudo bem? Falo com o responsável pela ").append(name).append("? 👋\n\n");
        pitch.append("Vi o perfil de vocês no Google Maps com excelente reputação: nota ").append(String.format("%.1f", stars))
             .append(" e ").append(reviewTotal).append(" avaliações ").append(neighborhood).append("!\n\n");

        pitch.append("Notei que vocês ainda não tinham um site próprio oficial de alta conversão, então tomei a liberdade de criar uma demonstração exclusiva de como ficaria o portal online da ").append(name).append(":\n");
        pitch.append("👉 ").append(demoUrl).append("\n\n");

        if (Boolean.TRUE.equals(domainAvailable) && suggestedDomain != null) {
            pitch.append("Além disso, verifiquei no Registro.br e o domínio oficial [").append(suggestedDomain).append("] está LIVRE para registro agora mesmo!\n\n");
        }

        pitch.append("O que achou da prévia? Teria 2 minutos para conversarmos sobre como colocar esse site no ar para atrair mais clientes?");
        demo.setWhatsappPitchWithDemo(pitch.toString());

        return demo;
    }

    private void applyGeminiResult(SiteDemoDto demo, SiteDemoDto gemini, String category) {
        demo.setAiPowered(true);
        demo.setHeadline(gemini.getHeadline());
        demo.setSubheadline(gemini.getSubheadline());
        demo.setSlogan(gemini.getSlogan());
        demo.setPrimaryCta(gemini.getPrimaryCta());
        demo.setTheme(gemini.getTheme() != null ? gemini.getTheme() : "indigo");
        demo.setPrimaryColor(gemini.getPrimaryColor());
        demo.setAccentColor(gemini.getAccentColor());
        demo.setAboutTitle(gemini.getAboutTitle());
        demo.setAboutText(gemini.getAboutText());
        demo.setBusinessHours(gemini.getBusinessHours());
        demo.setServices(gemini.getServices());
        demo.setPillars(gemini.getPillars());
        demo.setHighlights(gemini.getHighlights());
        demo.setTestimonials(gemini.getTestimonials());
        demo.setFaqs(gemini.getFaqs());

        // Se Gemini não gerou imagem, injeta as imagens temáticas correspondentes
        if (gemini.getHeroImageUrl() != null && !gemini.getHeroImageUrl().isBlank()) {
            demo.setHeroImageUrl(gemini.getHeroImageUrl());
        } else {
            demo.setHeroImageUrl(getDefaultHeroImage(category));
        }

        if (gemini.getGalleryImages() != null && !gemini.getGalleryImages().isEmpty()) {
            demo.setGalleryImages(gemini.getGalleryImages());
        } else {
            demo.setGalleryImages(getDefaultGalleryImages(category));
        }
    }

    private void applyCategoryTemplate(SiteDemoDto demo, String name, String category, String neighborhood,
                                       double stars, int reviews) {
        demo.setAiPowered(false);
        String lowerCat = category.toLowerCase();

        if (lowerCat.contains("açougue") || lowerCat.contains("carne") || lowerCat.contains("churrasco") || lowerCat.contains("boutique de carne")) {
            configureButcher(demo, name, neighborhood, stars, reviews);
        } else if (lowerCat.contains("pet") || lowerCat.contains("veterin") || lowerCat.contains("animal") || lowerCat.contains("banho")) {
            configurePetShop(demo, name, neighborhood, stars, reviews);
        } else if (lowerCat.contains("barbe") || lowerCat.contains("cabel") || lowerCat.contains("salão masculino")) {
            configureBarbershop(demo, name, neighborhood, stars, reviews);
        } else if (lowerCat.contains("odonto") || lowerCat.contains("dent") || lowerCat.contains("clínica") || lowerCat.contains("saúde") || lowerCat.contains("médic")) {
            configureClinic(demo, name, neighborhood, stars, reviews);
        } else if (lowerCat.contains("oficina") || lowerCat.contains("mecânic") || lowerCat.contains("auto") || lowerCat.contains("pneu") || lowerCat.contains("carro")) {
            configureAutomotive(demo, name, neighborhood, stars, reviews);
        } else if (lowerCat.contains("restaurante") || lowerCat.contains("pizz") || lowerCat.contains("hamburg") || lowerCat.contains("lanchonete") || lowerCat.contains("café") || lowerCat.contains("comida")) {
            configureFood(demo, name, neighborhood, stars, reviews);
        } else if (lowerCat.contains("estética") || lowerCat.contains("beleza") || lowerCat.contains("manicure") || lowerCat.contains("depila") || lowerCat.contains("sobrancelha")) {
            configureBeautySalon(demo, name, neighborhood, stars, reviews);
        } else {
            configureGeneralBusiness(demo, name, category, neighborhood, stars, reviews);
        }
    }

    private void configureButcher(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("crimson");
        demo.setPrimaryColor("#991b1b");
        demo.setAccentColor("#dc2626");
        demo.setSlogan("Tradição, Cortes Nobres e Sabor de Verdade");
        demo.setHeadline("Cortes Nobres e Carnes Selecionadas para o Seu Churrasco Perfeito");
        demo.setSubheadline("Atendimento de especialista, procedência garantida e entrega rápida para " + neighborhood + " e região.");
        demo.setPrimaryCta("Pedir no WhatsApp");
        demo.setHeroImageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80");
        demo.setGalleryImages(Arrays.asList(
                "https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&auto=format&fit=crop&q=80"
        ));
        demo.setAboutTitle("Paixão Pela Arte do Churrasco e Qualidade Impecável");
        demo.setAboutText("Na " + name + ", cada peça é rigorosamente inspecionada. Oferecemos cortes nobres frescos, porcionados a vácuo com o mais alto padrão de higiene e atendimento caloroso para toda a comunidade de " + neighborhood + ".");
        demo.setBusinessHours("Segunda a Sábado: 07:30 às 19:30 | Domingo: 08:00 às 13:00");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Picanha Prime & Ancho Argentino", "Cortes nobres com marmoreio macio e suculência incomparável.", "utensils", "Mais Vendido", "Sob Consulta"));
        services.add(new SiteDemoDto.ServiceItemDto("Kits Completos de Churrasco", "Carnes porcionadas, carvão, linguiças artesanais e acompanhamentos prontos.", "truck", "Praticidade", "Kits a partir de R$ 99"));
        services.add(new SiteDemoDto.ServiceItemDto("Espetinhos Artesanais Temperados", "Variedade de espetos com temperos exclusivos prontos para a grelha.", "sparkles", "Destaque", "R$ 4,50/un"));
        services.add(new SiteDemoDto.ServiceItemDto("Cortes Especiais para o Dia a Dia", "Alcatra, frango desossado, patinho moído na hora e porções a vácuo.", "check-circle", "Frescor", "Preços Especiais"));
        demo.setServices(services);

        demo.setPillars(Arrays.asList(
                new SiteDemoDto.PillarDto("Procedência Certificada", "Carnes selecionadas dos melhores frigoríficos com inspeção federal.", "shield"),
                new SiteDemoDto.PillarDto("Embalagem a Vácuo", "Garante frescor, sabor e conservação prolongada sem perder suculência.", "check-circle"),
                new SiteDemoDto.PillarDto("Cortes Personalizados", "Nossos mestres açougueiros preparam o corte na espessura que você preferir.", "award"),
                new SiteDemoDto.PillarDto("Entrega Rápida no Bairro", "Faça o pedido no WhatsApp e receba refrigerado no conforto de casa.", "truck")
        ));

        demo.setHighlights(Arrays.asList(
                "⭐ " + String.format("%.1f", stars) + " estrelas com mais de " + reviews + " avaliações no Google Maps",
                "Embalagens seladas a vácuo para máxima segurança alimentar",
                "Aceitamos todos os cartões, vale-refeição e Pix com entrega ágil"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Carlos Eduardo M.", "Melhor açougue da região! Atendimento nota 10 e a picanha derrete na boca.", 5, "há 2 semanas"),
                new SiteDemoDto.TestimonialDto("Renata Silveira", "Tudo muito limpo, organizado e carnes sempre frescas. Faço pedido pelo WhatsApp toda semana.", 5, "há 1 mês"),
                new SiteDemoDto.TestimonialDto("Fábio Oliveira", "O kit churrasco salvou a festa da família. Tudo impecável e pontual!", 5, "há 3 semanas")
        ));

        demo.setFaqs(Arrays.asList(
                new SiteDemoDto.FaqDto("Como faço pedidos para entrega?", "Basta clicar no botão de WhatsApp, informar os cortes que deseja e enviamos seu pedido rapidamente com embalagem térmica."),
                new SiteDemoDto.FaqDto("As carnes já vêm temperadas?", "Temos opções in natura e também linhas artesanais pré-temperadas com receitas exclusivas."),
                new SiteDemoDto.FaqDto("Vocês preparam cortes sob encomenda?", "Sim! Você pode solicitar a grossura do corte (1 dedo, 2 dedos, etc.) e preparamos exatamente como você preferir.")
        ));
    }

    private void configurePetShop(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("emerald");
        demo.setPrimaryColor("#059669");
        demo.setAccentColor("#10b981");
        demo.setSlogan("Amor, Cuidado e Carinho para o Seu Melhor Amigo");
        demo.setHeadline("O Melhor Cuidado e Bem-Estar que o Seu Pet Merece");
        demo.setSubheadline("Banho & Tosa humanizado sem estresse, rações super premium e atenção total para cães e gatos em " + neighborhood + ".");
        demo.setPrimaryCta("Agendar Horário no WhatsApp");
        demo.setHeroImageUrl("https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&auto=format&fit=crop&q=80");
        demo.setGalleryImages(Arrays.asList(
                "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80"
        ));
        demo.setAboutTitle("Dedicados à Felicidade e Saúde dos Bichinhos");
        demo.setAboutText("A " + name + " nasceu do amor genuíno pelos animais. Com profissionais certificados e ambiente acolhedor, tratamos cada pet como membro da família. Desde a tosa especializada até a ração balanceada, tudo é pensado com carinho.");
        demo.setBusinessHours("Segunda a Sexta: 08:00 às 18:30 | Sábado: 08:00 às 17:00");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Banho & Hidratação Terapêutica", "Produtos hipoalergênicos, toalhas esterilizadas e secagem silenciosa sem estresse.", "sparkles", "Favorito", "A partir de R$ 55"));
        services.add(new SiteDemoDto.ServiceItemDto("Tosa Higiênica e da Raça", "Cortes profissionais na tesoura ou máquina respeitando o padrão e pelagem do seu animal.", "scissors", "Especialidade", "A partir de R$ 70"));
        services.add(new SiteDemoDto.ServiceItemDto("Serviço de Leva e Traz Seguro", "Veículo climatizado e caixas individuais para o conforto do seu pet.", "truck", "Comodidade", "Consulte Raio"));
        services.add(new SiteDemoDto.ServiceItemDto("Rações Super Premium & Farmácia", "Alimentação de alta digestibilidade, petiscos saudáveis e antipulgas líderes de mercado.", "heart", "Variedade", "Linha Completa"));
        demo.setServices(services);

        demo.setPillars(Arrays.asList(
                new SiteDemoDto.PillarDto("Manejo Livre de Estresse", "Profissionais treinados em comportamento animal para um banho calmo e prazeroso.", "heart"),
                new SiteDemoDto.PillarDto("Higiene Hospitalar", "Toalhas descartáveis e esterilização de instrumentos a cada atendimento.", "shield"),
                new SiteDemoDto.PillarDto("Produtos Premium", "Linha cosmética de padrão internacional que não agride os olhos nem a pele.", "sparkles"),
                new SiteDemoDto.PillarDto("Pontualidade Britânica", "Horários marcados com antecedência para evitar longas esperas no pet shop.", "clock")
        ));

        demo.setHighlights(Arrays.asList(
                "⭐ " + String.format("%.1f", stars) + " estrelas com mais de " + reviews + " avaliações no Google Maps",
                "Ambiente climatizado e monitorado por câmeras",
                "Agendamento prático pelo WhatsApp em segundos"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Juliana Castro", "O Thor sempre teve pavor de banho, mas aqui ele sai feliz da vida e super cheiroso. Equipe maravilhosa!", 5, "há 3 semanas"),
                new SiteDemoDto.TestimonialDto("Marcos Vinicius", "A tosa na tesoura do meu Spitz ficou perfeita. Pontualidade e atenção impecáveis.", 5, "há 1 mês"),
                new SiteDemoDto.TestimonialDto("Camila Rocha", "Uso o leva e traz toda semana. Muito confiáveis e carinhosos com meus dois gatos.", 5, "há 2 semanas")
        ));

        demo.setFaqs(Arrays.asList(
                new SiteDemoDto.FaqDto("Como funciona o serviço de Leva e Traz?", "Buscamos e entregamos seu pet em veículo climatizado e com caixas de transporte individuais higienizadas."),
                new SiteDemoDto.FaqDto("Qual a antecedência necessária para agendar?", "Recomendamos agendar com 1 a 2 dias de antecedência pelo WhatsApp para garantir seu horário de preferência."),
                new SiteDemoDto.FaqDto("Vocês atendem filhotes e cães idosos?", "Sim! Temos protocolos especiais de carinho, temperatura da água e secagem para pets idosos e filhotes.")
        ));
    }

    private void configureBarbershop(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("gold-dark");
        demo.setPrimaryColor("#0f172a");
        demo.setAccentColor("#d97706");
        demo.setSlogan("Estilo, Atitude e Tradição para o Homem Moderno");
        demo.setHeadline("Muito Mais que um Corte de Cabelo: Uma Experiência Premium");
        demo.setSubheadline("Cortes clássicos e modernos, barba desenhada com toalha quente e ambiente exclusivo no " + neighborhood + ".");
        demo.setPrimaryCta("Agendar Horário no WhatsApp");
        demo.setHeroImageUrl("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80");
        demo.setGalleryImages(Arrays.asList(
                "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&auto=format&fit=crop&q=80"
        ));
        demo.setAboutTitle("A Arte da Barbearia Clássica com Toque Contemporâneo");
        demo.setAboutText("A " + name + " foi criada para proporcionar um momento de relaxamento enquanto você cuida da sua imagem. Mestres barbeiros qualificados, toalha quente com óleos essenciais, cerveja gelada e trilha sonora selecionada.");
        demo.setBusinessHours("Terça a Sábado: 09:00 às 20:00 | Domingo: Fechado");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Corte Fade & Tesoura Premium", "Degradê suave (low, mid, taper), finalização com pomada matte e lavagem.", "scissors", "Top 1", "R$ 45"));
        services.add(new SiteDemoDto.ServiceItemDto("Barboterapia com Toalha Quente", "Massagem facial, esfoliação, toalha aquecida e navalha afiada com precisão.", "sparkles", "Relaxamento", "R$ 40"));
        services.add(new SiteDemoDto.ServiceItemDto("Combo Cabelo + Barba Alinhada", "O pacote completo do cavalheiro moderno para sair renovado.", "star", "Melhor Valor", "R$ 75"));
        services.add(new SiteDemoDto.ServiceItemDto("Camuflagem de Grisalhos", "Cobertura natural dos fios brancos com efeito sutil e duradouro.", "check-circle", "Exclusivo", "R$ 50"));
        demo.setServices(services);

        demo.setPillars(Arrays.asList(
                new SiteDemoDto.PillarDto("Pontualidade Garantida", "Respeito total ao seu tempo: atenda no horário sem filas ou atrasos.", "clock"),
                new SiteDemoDto.PillarDto("Mestres Barbeiros", "Profissionais atualizados com as principais tendências e técnicas internacionais.", "award"),
                new SiteDemoDto.PillarDto("Navalhas Esterilizadas", "Higiene rigorosa com lâminas descartáveis e instrumentos esterilizados em autoclave.", "shield"),
                new SiteDemoDto.PillarDto("Ambiente Lounge", "Wi-Fi rápido, café expresso ou cerveja gelada por conta da casa.", "sparkles")
        ));

        demo.setHighlights(Arrays.asList(
                "⭐ " + String.format("%.1f", stars) + " estrelas com " + reviews + " avaliações no Google",
                "Ambiente climatizado e aconchegante com lounge",
                "Agendamento online sem complicações"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Thiago Rocha", "Ambiente sensacional! Pontuais e mandam muito no degradê. Virei cliente fiel.", 5, "há 1 semana"),
                new SiteDemoDto.TestimonialDto("Lucas Prado", "A barboterapia é outro nível. Saio relaxado e com a barba alinhada perfeitamente.", 5, "há 3 semanas"),
                new SiteDemoDto.TestimonialDto("Bruno Guimarães", "Atendimento impecável desde a recepção até a cadeira. Nota 10!", 5, "há 2 semanas")
        ));

        demo.setFaqs(Arrays.asList(
                new SiteDemoDto.FaqDto("Preciso agendar com antecedência?", "Recomendamos agendar para não pegar fila, mas também atendemos por ordem de chegada havendo cadeira disponível."),
                new SiteDemoDto.FaqDto("Quais formas de pagamento são aceitas?", "Aceitamos Pix, cartões de crédito, débito e dinheiro."),
                new SiteDemoDto.FaqDto("Vocês fazem sobrancelha e barba desenhada?", "Sim! Fazemos alinhamento de sobrancelha na navalha e desenho personalizado de barba.")
        ));
    }

    private void configureClinic(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("blue");
        demo.setPrimaryColor("#0284c7");
        demo.setAccentColor("#0369a1");
        demo.setSlogan("Saúde, Conforto e Tecnologia para o Seu Bem-Estar");
        demo.setHeadline("Excelência Médica e Odontológica com Atendimento Humanizado");
        demo.setSubheadline("Tecnologia de ponta, diagnósticos precisos e tratamentos seguros para você e toda sua família no " + neighborhood + ".");
        demo.setPrimaryCta("Agendar Consulta no WhatsApp");
        demo.setHeroImageUrl("https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=80");
        demo.setGalleryImages(Arrays.asList(
                "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80"
        ));
        demo.setAboutTitle("Compromisso com o Seu Sorriso e Qualidade de Vida");
        demo.setAboutText("A " + name + " reúne especialistas comprometidos em transformar consultas em momentos tranquilos e acolhedores. Dispomos de infraestrutura digital moderna, biossegurança rigorosa e planos de tratamento claros.");
        demo.setBusinessHours("Segunda a Sexta: 08:00 às 19:00 | Sábado: 08:00 às 13:00");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Check-up Digital & Limpeza", "Avaliação minuciosa com câmera intraoral e prevenção sem dor.", "shield", "Essencial", "Avaliação Inicial"));
        services.add(new SiteDemoDto.ServiceItemDto("Clareamento Dental a Laser", "Sorriso branco, natural e radiante com resultados visíveis na primeira sessão.", "sparkles", "Estética", "Condições Especiais"));
        services.add(new SiteDemoDto.ServiceItemDto("Alinhadores Invisíveis", "Correção ortodôntica moderna, discreta e removível planejada em 3D.", "check-circle", "Tecnologia", "Planejamento Digital"));
        services.add(new SiteDemoDto.ServiceItemDto("Implantes e Próteses Fixas", "Recuperação funcional e estética mastigatória com técnicas seguras.", "star", "Especialidade", "Consulte Parcelamento"));
        demo.setServices(services);

        demo.setPillars(Arrays.asList(
                new SiteDemoDto.PillarDto("Biossegurança Rigorosa", "Protocolos hospitalares de esterilização e materiais descartáveis.", "shield"),
                new SiteDemoDto.PillarDto("Tecnologia Diagnóstica 3D", "Imagens digitais para procedimentos guiados de alta precisão.", "sparkles"),
                new SiteDemoDto.PillarDto("Atendimento Humanizado", "Equipe calma e paciente, especializada no cuidado de pacientes com receio de dentista.", "heart"),
                new SiteDemoDto.PillarDto("Facilidade de Pagamento", "Parcelamento flexível e orçamentos transparentes sem surpresas.", "award")
        ));

        demo.setHighlights(Arrays.asList(
                "⭐ " + String.format("%.1f", stars) + " estrelas com mais de " + reviews + " avaliações no Google",
                "Estrutura moderna no coração do " + neighborhood,
                "Atendimento com hora marcada e sala de espera confortável"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Beatriz Almeida", "Consultório impecável, atendimento acolhedor e sem aquela dor chata. Recomendo demais!", 5, "há 1 mês"),
                new SiteDemoDto.TestimonialDto("Gabriel Santos", "Fiz o clareamento e meus dentes ficaram incríveis sem nenhuma sensibilidade. Nota mil!", 5, "há 2 semanas"),
                new SiteDemoDto.TestimonialDto("Patrícia Souza", "Profissionais super capacitados e ambiente que passa total segurança.", 5, "há 3 semanas")
        ));

        demo.setFaqs(Arrays.asList(
                new SiteDemoDto.FaqDto("Como agendo minha primeira avaliação?", "Você pode agendar pelo WhatsApp escolhendo o melhor dia e horário para a sua conveniência."),
                new SiteDemoDto.FaqDto("Vocês atendem planos de saúde?", "Atendemos particular com facilidades de parcelamento e emitimos recibos para reembolso de convênios."),
                new SiteDemoDto.FaqDto("Os procedimentos causam dor?", "Utilizamos anestesias modernas e técnicas minimamente invasivas para garantir total conforto durante o tratamento.")
        ));
    }

    private void configureAutomotive(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("slate");
        demo.setPrimaryColor("#1e293b");
        demo.setAccentColor("#2563eb");
        demo.setSlogan("Mecânica de Alta Precisão, Honestidade e Transparência");
        demo.setHeadline("Manutenção Mecânica de Confiança para a Segurança do Seu Carro");
        demo.setSubheadline("Diagnóstico computadorizado, peças originais e garantia formal em cada serviço no " + neighborhood + ".");
        demo.setPrimaryCta("Solicitar Orçamento no WhatsApp");
        demo.setHeroImageUrl("https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&auto=format&fit=crop&q=80");
        demo.setGalleryImages(Arrays.asList(
                "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80"
        ));
        demo.setAboutTitle("Honestidade Mecânica e Cuidado com o Seu Patrimônio");
        demo.setAboutText("Na " + name + ", você acompanha cada etapa com explicações claras e fotos do que realmente precisa ser trocado. Atuamos há anos em " + neighborhood + " como referência em compromisso ético e entrega pontual.");
        demo.setBusinessHours("Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:30");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Revisão Preventiva Geral", "Checagem minuciosa de mais de 40 itens essenciais para sua viagem ou dia a dia.", "shield", "Mais Procurado", "A partir de R$ 120"));
        services.add(new SiteDemoDto.ServiceItemDto("Diagnóstico por Scanner Digital", "Identificação precisa de falhas de injeção eletrônica e luz da injeção acesa.", "sparkles", "Tecnologia", "Diagnóstico Rápido"));
        services.add(new SiteDemoDto.ServiceItemDto("Freios, Suspensão & Direção", "Troca de pastilhas, discos, amortecedores e alinhamento 3D.", "check-circle", "Segurança", "Sob Avaliação"));
        services.add(new SiteDemoDto.ServiceItemDto("Troca de Óleo & Filtros Express", "Lubrificantes homologados pelas montadoras para prolongar a vida útil do motor.", "star", "Rapidez", "Kits com Troca"));
        demo.setServices(services);

        demo.setPillars(Arrays.asList(
                new SiteDemoDto.PillarDto("Transparência Absoluta", "Apenas as peças necessárias são trocadas, com apresentação prévia das antigas.", "award"),
                new SiteDemoDto.PillarDto("Garantia de Serviço", "Garantia formal de 90 dias em todas as peças e serviços executados.", "shield"),
                new SiteDemoDto.PillarDto("Equipamentos Modernos", "Scanners digitais atualizados para veículos nacionais e importados.", "sparkles"),
                new SiteDemoDto.PillarDto("Pontualidade no Prazo", "Compromisso com o horário de entrega do veículo para não atrapalhar seu dia.", "clock")
        ));

        demo.setHighlights(Arrays.asList(
                "⭐ " + String.format("%.1f", stars) + " estrelas com mais de " + reviews + " avaliações no Google",
                "Orçamento detalhado enviado diretamente pelo WhatsApp",
                "Facilidade de pagamento em até 10x no cartão"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Fernando Costa", "Oficina mais honesta que já encontrei em SP. Preço justo e serviço de primeira linha.", 5, "há 1 mês"),
                new SiteDemoDto.TestimonialDto("Patrícia Lima", "Explicaram tudo com fotos e entregaram o carro antes do prazo. Virei cliente com certeza.", 5, "há 3 semanas"),
                new SiteDemoDto.TestimonialDto("Marcelo Vieira", "Diagnosticaram um barulho chato que outras duas oficinas não acharam. Perfeitos!", 5, "há 2 semanas")
        ));

        demo.setFaqs(Arrays.asList(
                new SiteDemoDto.FaqDto("Como solicito um orçamento?", "Basta enviar uma mensagem no WhatsApp com o modelo/ano do seu carro e o que você precisa."),
                new SiteDemoDto.FaqDto("Vocês dão garantia nos serviços?", "Sim! Oferecemos garantia completa tanto nas peças genuínas quanto na mão de obra especializada."),
                new SiteDemoDto.FaqDto("Posso acompanhar o serviço?", "Claro! Enviamos fotos e vídeos pelo WhatsApp mostrando as etapas da manutenção do seu veículo.")
        ));
    }

    private void configureFood(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("amber");
        demo.setPrimaryColor("#b45309");
        demo.setAccentColor("#d97706");
        demo.setSlogan("Sabor Inesquecível e Ingredientes de Primeira Qualidade");
        demo.setHeadline("Gastronomia Artesanal que Transforma Qualquer Momento em Festa");
        demo.setSubheadline("Pratos preparados na hora, receitas exclusivas e entrega quentinha para você em " + neighborhood + ".");
        demo.setPrimaryCta("Ver Cardápio & Pedir");
        demo.setHeroImageUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80");
        demo.setGalleryImages(Arrays.asList(
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80"
        ));
        demo.setAboutTitle("Paixão Por Servir Com Amor e Ingredientes Selecionados");
        demo.setAboutText("A " + name + " valoriza a essência da culinária autêntica. Cada receita combina temperos frescos, cocção no ponto certo e carinho, criando lembranças gastronômicas marcantes para os moradores de " + neighborhood + ".");
        demo.setBusinessHours("Terça a Domingo: 18:00 às 23:30 | Almoço: Sábado e Domingo 11:30 às 15:30");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Cardápio Artesanal da Casa", "Receitas autorais e preparo com produtos frescos todos os dias.", "utensils", "Mais Pedido", "Ver Valores"));
        services.add(new SiteDemoDto.ServiceItemDto("Delivery Rápido & Embalagem Térmica", "Seu pedido chega quentinho e crocante sem perder textura.", "truck", "Entrega Rápida", "Taxa Econômica"));
        services.add(new SiteDemoDto.ServiceItemDto("Combos Especiais para Família", "Porções generosas perfeitas para reunir quem você ama.", "star", "Melhor Custo", "Combos Exclusivos"));
        services.add(new SiteDemoDto.ServiceItemDto("Sobremesas Artesanais", "Finalize sua refeição com sobremesas feitas diariamente na cozinha.", "sparkles", "Destaque", "A partir de R$ 14"));
        demo.setServices(services);

        demo.setPillars(Arrays.asList(
                new SiteDemoDto.PillarDto("Ingredientes Selecionados", "Nada de ultraprocessados: vegetais frescos, queijos nobres e carnes selecionadas.", "award"),
                new SiteDemoDto.PillarDto("Embalagem Térmica Especial", "Mantém a comida na temperatura ideal até chegar na sua mesa.", "truck"),
                new SiteDemoDto.PillarDto("Higiene Exemplar", "Cozinha com padrões de segurança alimentar e inspeção sanitária permanente.", "shield"),
                new SiteDemoDto.PillarDto("Peça Direto Sem Taxas Abusivas", "Pedindo no nosso WhatsApp você economiza e ganha mimos exclusivos.", "heart")
        ));

        demo.setHighlights(Arrays.asList(
                "⭐ " + String.format("%.1f", stars) + " estrelas com mais de " + reviews + " avaliações no Google",
                "Entrega ágil em todo o " + neighborhood,
                "Peça no WhatsApp e receba confirmação instantânea"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Marina Duarte", "Simplesmente maravilhoso! Chegou quentinho e muito bem embalado. Melhor do bairro!", 5, "há 2 semanas"),
                new SiteDemoDto.TestimonialDto("Rodrigo Paiva", "Sabor caseiro autêntico e porção super generosa. Pedimos todo final de semana.", 5, "há 1 mês"),
                new SiteDemoDto.TestimonialDto("Carolina Mendes", "Atendimento no WhatsApp super rápido e a comida é um espetáculo.", 5, "há 3 semanas")
        ));

        demo.setFaqs(Arrays.asList(
                new SiteDemoDto.FaqDto("Como faço meu pedido?", "Basta clicar em qualquer botão do WhatsApp para abrir o cardápio e enviar seu pedido em instantes."),
                new SiteDemoDto.FaqDto("Qual o tempo médio de entrega?", "O tempo médio varia entre 35 e 50 minutos dependendo do horário e localização."),
                new SiteDemoDto.FaqDto("Quais formas de pagamento são aceitas?", "Aceitamos Pix, cartões de débito, crédito e dinheiro na entrega.")
        ));
    }

    private void configureBeautySalon(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("purple");
        demo.setPrimaryColor("#7e22ce");
        demo.setAccentColor("#a855f7");
        demo.setSlogan("Realce Sua Beleza com Cuidado, Estilo e Sofisticação");
        demo.setHeadline("Sua Melhor Versão Começa com Cuidados de Alta Performance");
        demo.setSubheadline("Cabelos deslumbrantes, estética facial e unhas impecáveis com atendimento exclusivo no " + neighborhood + ".");
        demo.setPrimaryCta("Agendar Horário no WhatsApp");
        demo.setHeroImageUrl("https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80");
        demo.setGalleryImages(Arrays.asList(
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&auto=format&fit=crop&q=80"
        ));
        demo.setAboutTitle("Ambiente Aconchegante e Profissionais Especializadas");
        demo.setAboutText("A " + name + " foi planejada para ser seu refúgio de bem-estar. Produtos profissionais das melhores marcas mundiais, técnicas modernas e um atendimento que valoriza sua individualidade.");
        demo.setBusinessHours("Terça a Sábado: 09:00 às 19:30 | Domingo: Fechado");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Mechas, Morena Iluminada & Coloração", "Técnicas modernas que preservam a saúde dos fios com brilho espelhado.", "sparkles", "Mais Desejado", "Avaliação Gratuita"));
        services.add(new SiteDemoDto.ServiceItemDto("Tratamentos & Cronograma Capilar", "Nutrição, reconstrução e hidratação profunda com marcas de prestígio.", "heart", "Saúde Capilar", "A partir de R$ 90"));
        services.add(new SiteDemoDto.ServiceItemDto("Design de Sobrancelhas & Lash Lifting", "Olhar marcante com simetria perfeita personalizada para seu formato de rosto.", "star", "Tendência", "A partir de R$ 50"));
        services.add(new SiteDemoDto.ServiceItemDto("Manicure & Spa dos Pés", "Esmaltação em gel, cuticulagem segura e relaxamento com hidratação.", "check-circle", "Essencial", "A partir de R$ 40"));
        demo.setServices(services);

        demo.setPillars(Arrays.asList(
                new SiteDemoDto.PillarDto("Produtos de Alta Performance", "Trabalhamos com linhas profissionais consagradas para resultados duradouros.", "award"),
                new SiteDemoDto.PillarDto("Biossegurança & Higiene", "Alicates e materiais esterilizados rigorosamente em autoclave.", "shield"),
                new SiteDemoDto.PillarDto("Consultoria Personalizada", "Análise detalhada do seu estilo antes de iniciar qualquer procedimento.", "sparkles"),
                new SiteDemoDto.PillarDto("Momento de Relaxamento", "Cafés especiais, ambiente climatizado e conforto absoluto para você.", "heart")
        ));

        demo.setHighlights(Arrays.asList(
                "⭐ " + String.format("%.1f", stars) + " estrelas com " + reviews + " avaliações carinhosas no Google",
                "Atendimento com hora marcada para você não esperar",
                "Espaço aconchegante e elegante no " + neighborhood
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Ana Paula Freitas", "Fiz minhas mechas e ficaram exatamente como eu sonhava! Cabelo saudável e lindo.", 5, "há 2 semanas"),
                new SiteDemoDto.TestimonialDto("Carla Nogueira", "Espaço maravilhoso, profissionais atenciosas e o spa dos pés é dos deuses!", 5, "há 1 mês"),
                new SiteDemoDto.TestimonialDto("Jéssica Martins", "Melhor salão do bairro! Sempre pontuais e muito caprichosas.", 5, "há 3 semanas")
        ));

        demo.setFaqs(Arrays.asList(
                new SiteDemoDto.FaqDto("Como agendo meu horário?", "Basta clicar no botão de WhatsApp e nossa recepção passará os horários disponíveis em segundos."),
                new SiteDemoDto.FaqDto("Vocês fazem teste de mechas?", "Sim! Para procedimentos químicos, sempre realizamos o teste de mechas preventivo para garantir a saúde dos fios."),
                new SiteDemoDto.FaqDto("Quais formas de pagamento vocês aceitam?", "Aceitamos Pix, dinheiro e parcelamos nos principais cartões de crédito.")
        ));
    }

    private void configureGeneralBusiness(SiteDemoDto demo, String name, String category, String neighborhood,
                                          double stars, int reviews) {
        demo.setTheme("indigo");
        demo.setPrimaryColor("#4f46e5");
        demo.setAccentColor("#6366f1");
        demo.setSlogan("Compromisso, Agilidade e Excelência em Cada Atendimento");
        demo.setHeadline("Referência em " + category + " com Atendimento de Alto Padrão no " + neighborhood);
        demo.setSubheadline("Soluções sob medida, profissionais experientes e foco total na sua satisfação e comodidade.");
        demo.setPrimaryCta("Falar no WhatsApp");
        demo.setHeroImageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80");
        demo.setGalleryImages(Arrays.asList(
                "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80"
        ));
        demo.setAboutTitle("Compromisso com Resultados e Satisfação do Cliente");
        demo.setAboutText("A " + name + " destaca-se pela dedicação contínua em entregar as melhores soluções em " + category + ". Com anos de experiência no mercado de " + neighborhood + ", nossa missão é superar expectativas através da qualidade e transparência.");
        demo.setBusinessHours("Segunda a Sexta: 08:30 às 18:30 | Sábado: 09:00 às 13:00");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Atendimento Consultivo Especializado", "Diagnóstico das suas necessidades para indicar a melhor solução com agilidade.", "star", "Destaque", "Consulte Condições"));
        services.add(new SiteDemoDto.ServiceItemDto("Soluções Completas Sob Medida", "Serviços executados com rigor técnico e conformidade com os mais altos padrões.", "shield", "Garantia", "Sob Medida"));
        services.add(new SiteDemoDto.ServiceItemDto("Orçamento Rápido e Sem Burocracia", "Consulte valores e condições diretamente pelo WhatsApp em minutos.", "check-circle", "Agilidade", "Orçamento Grátis"));
        services.add(new SiteDemoDto.ServiceItemDto("Suporte e Acompanhamento Dedicado", "Acompanhamento pós-venda para garantir total tranquilidade na sua experiência.", "sparkles", "Confiabilidade", "Suporte Completo"));
        demo.setServices(services);

        demo.setPillars(Arrays.asList(
                new SiteDemoDto.PillarDto("Experiência Comprovada", "Anos de atuação com equipe técnica altamente capacitada.", "award"),
                new SiteDemoDto.PillarDto("Agilidade no Atendimento", "Resposta rápida no WhatsApp sem filas de espera.", "clock"),
                new SiteDemoDto.PillarDto("Garantia e Segurança", "Procedimentos transparentes e segurança em todas as etapas.", "shield"),
                new SiteDemoDto.PillarDto("Melhor Custo-Benefício", "Preços justos e condições flexíveis de pagamento.", "check-circle")
        ));

        demo.setHighlights(Arrays.asList(
                "⭐ " + String.format("%.1f", stars) + " estrelas com " + reviews + " clientes atendidos no Google",
                "Localização estratégica e de fácil acesso no " + neighborhood,
                "Atendimento imediato via canal digital no WhatsApp"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Mariana Souza", "Atendimento impecável! Resolveram tudo muito rápido e com muita simpatia.", 5, "há 3 semanas"),
                new SiteDemoDto.TestimonialDto("Felipe Guimarães", "Empresa séria, cumprem os prazos e o preço é justo. Recomendo com certeza.", 5, "há 1 mês"),
                new SiteDemoDto.TestimonialDto("Cláudia Ramos", "Muito satisfeita com a atenção e profissionalismo da equipe.", 5, "há 2 semanas")
        ));

        demo.setFaqs(Arrays.asList(
                new SiteDemoDto.FaqDto("Como solicito um orçamento?", "Basta clicar em Falar no WhatsApp e enviar sua dúvida ou solicitação que responderemos prontamente."),
                new SiteDemoDto.FaqDto("Quais são as opções de pagamento?", "Trabalhamos com Pix, transferência bancária e principais cartões de crédito e débito."),
                new SiteDemoDto.FaqDto("Vocês atendem fora do horário comercial?", "Nossas mensagens de WhatsApp podem ser enviadas a qualquer momento e são respondidas no primeiro horário útil.")
        ));
    }

    private String getDefaultHeroImage(String category) {
        String cat = (category != null) ? category.toLowerCase() : "";
        if (cat.contains("açougue") || cat.contains("carne") || cat.contains("churrasco")) {
            return "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80";
        } else if (cat.contains("pet") || cat.contains("veterin") || cat.contains("animal")) {
            return "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&auto=format&fit=crop&q=80";
        } else if (cat.contains("barbe") || cat.contains("cabel")) {
            return "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80";
        } else if (cat.contains("odonto") || cat.contains("dent") || cat.contains("clínica") || cat.contains("saúde")) {
            return "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=80";
        } else if (cat.contains("oficina") || cat.contains("mecânic") || cat.contains("auto")) {
            return "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&auto=format&fit=crop&q=80";
        } else if (cat.contains("restaurante") || cat.contains("pizz") || cat.contains("hamburg") || cat.contains("comida")) {
            return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80";
        } else if (cat.contains("estética") || cat.contains("beleza") || cat.contains("salão")) {
            return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80";
        }
        return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80";
    }

    private List<String> getDefaultGalleryImages(String category) {
        String cat = (category != null) ? category.toLowerCase() : "";
        if (cat.contains("açougue") || cat.contains("carne") || cat.contains("churrasco")) {
            return Arrays.asList(
                    "https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&auto=format&fit=crop&q=80"
            );
        } else if (cat.contains("pet") || cat.contains("veterin") || cat.contains("animal")) {
            return Arrays.asList(
                    "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80"
            );
        } else if (cat.contains("barbe") || cat.contains("cabel")) {
            return Arrays.asList(
                    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&auto=format&fit=crop&q=80"
            );
        } else if (cat.contains("odonto") || cat.contains("dent") || cat.contains("clínica") || cat.contains("saúde")) {
            return Arrays.asList(
                    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80"
            );
        } else if (cat.contains("oficina") || cat.contains("mecânic") || cat.contains("auto")) {
            return Arrays.asList(
                    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80"
            );
        } else if (cat.contains("restaurante") || cat.contains("pizz") || cat.contains("hamburg") || cat.contains("comida")) {
            return Arrays.asList(
                    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80"
            );
        }
        return Arrays.asList(
                "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80"
        );
    }
}

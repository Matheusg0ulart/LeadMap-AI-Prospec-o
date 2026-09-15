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

    public SiteDemoService(BusinessRepository businessRepository,
                           WhatsAppPitchService whatsAppPitchService,
                           DomainCheckService domainCheckService) {
        this.businessRepository = businessRepository;
        this.whatsAppPitchService = whatsAppPitchService;
        this.domainCheckService = domainCheckService;
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
        double stars = rating != null ? rating : 4.8;
        int reviewTotal = reviews != null && reviews > 0 ? reviews : 42;
        String cleanPhone = whatsAppPitchService.sanitizePhoneForWhatsApp(phone);

        // Define location string
        String neighborhood = "São Paulo";
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

        // AI Category Analysis & Content Customization
        String lowerCat = category.toLowerCase();

        if (lowerCat.contains("açougue") || lowerCat.contains("carne") || lowerCat.contains("churrasco") || lowerCat.contains("boutique de carne")) {
            configureButcher(demo, name, neighborhood, stars, reviewTotal);
        } else if (lowerCat.contains("pet") || lowerCat.contains("veterin") || lowerCat.contains("animal")) {
            configurePetShop(demo, name, neighborhood, stars, reviewTotal);
        } else if (lowerCat.contains("barbe") || lowerCat.contains("cabel") || lowerCat.contains("estética") || lowerCat.contains("salão")) {
            configureBarberOrBeauty(demo, name, neighborhood, stars, reviewTotal);
        } else if (lowerCat.contains("odonto") || lowerCat.contains("dent") || lowerCat.contains("clínica") || lowerCat.contains("saúde") || lowerCat.contains("médic")) {
            configureClinic(demo, name, neighborhood, stars, reviewTotal);
        } else if (lowerCat.contains("oficina") || lowerCat.contains("mecânic") || lowerCat.contains("auto") || lowerCat.contains("pneu")) {
            configureAutomotive(demo, name, neighborhood, stars, reviewTotal);
        } else if (lowerCat.contains("restaurante") || lowerCat.contains("pizz") || lowerCat.contains("hamburg") || lowerCat.contains("lanchonete") || lowerCat.contains("café")) {
            configureFood(demo, name, neighborhood, stars, reviewTotal);
        } else {
            configureGeneralBusiness(demo, name, category, neighborhood, stars, reviewTotal);
        }

        // Generate sales pitch including the demo link
        StringBuilder pitch = new StringBuilder();
        pitch.append("Olá! Tudo bem? Falo com o responsável pela ").append(name).append("? 👋\n\n");
        pitch.append("Vi o perfil de vocês no Google Maps com nota ").append(String.format("%.1f", stars))
             .append(" e ").append(reviewTotal).append(" avaliações ").append("no ").append(neighborhood).append("!\n\n");

        pitch.append("Notei que vocês ainda não tinham um site próprio oficial, então tomei a liberdade de criar uma demonstração exclusiva de como ficaria o portal online da ").append(name).append(":\n");
        pitch.append("👉 ").append(demoUrl).append("\n\n");

        if (Boolean.TRUE.equals(domainAvailable) && suggestedDomain != null) {
            pitch.append("Além disso, verifiquei no Registro.br e o domínio oficial [").append(suggestedDomain).append("] está LIVRE para registro agora mesmo!\n\n");
        }

        pitch.append("O que achou da prévia? Teria 2 minutos para conversarmos sobre como colocar esse site no ar para atrair mais clientes?");
        demo.setWhatsappPitchWithDemo(pitch.toString());

        return demo;
    }

    private void configureButcher(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("amber");
        demo.setPrimaryColor("#b91c1c");
        demo.setAccentColor("#ea580c");
        demo.setHeadline("Cortes Nobres e Qualidade Impecável no " + neighborhood);
        demo.setSubheadline("Tradição, carnes selecionadas e o melhor atendimento para transformar o seu churrasco em uma experiência inesquecível.");
        demo.setPrimaryCta("Pedir no WhatsApp");
        demo.setAboutTitle("Tradição em Qualidade e Respeito ao Cliente");
        demo.setAboutText("Na " + name + ", cada peça de carne é selecionada com rigor de procedência e frescor. Atendemos a região do " + neighborhood + " com cortes especiais, kits para churrasco e atendimento personalizado de especialistas.");
        demo.setBusinessHours("Segunda a Sábado: 07:30 às 19:30 | Domingo: 08:00 às 13:00");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Cortes Nobres & Especiais", "Picanhas argentinas, Prime Rib, Ancho, Tomahawk e Wagyu com marmoreio perfeito.", "utensils", "Destaque"));
        services.add(new SiteDemoDto.ServiceItemDto("Kits Completos para Churrasco", "Monte o churrasco da sua família ou empresa com carnes porcionadas, carvão e acompanhamentos.", "truck", "Praticidade"));
        services.add(new SiteDemoDto.ServiceItemDto("Linha de Espetinhos Artesanais", "Espetos temperados artesanalmente com receitas exclusivas prontos para assar.", "sparkles", "Mais Vendido"));
        services.add(new SiteDemoDto.ServiceItemDto("Cortes para o Dia a Dia", "Alcatra, patinho moído na hora, frango desossado e porções a vácuo para a sua semana.", "check-circle", "Frescor Garantido"));
        demo.setServices(services);

        demo.setHighlights(Arrays.asList(
                "Avaliação " + String.format("%.1f", stars) + " estrelas com mais de " + reviews + " clientes atendidos",
                "Embalagens a vácuo para maior durabilidade e frescor",
                "Entrega expressa ou retirada rápida na loja"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Carlos Eduardo M.", "Melhor açougue da região! Atendimento nota 10 e a picanha derrete na boca.", 5, "há 2 semanas"),
                new SiteDemoDto.TestimonialDto("Renata Silveira", "Tudo muito limpo, organizado e carnes sempre frescas. Faço pedido pelo WhatsApp toda semana.", 5, "há 1 mês")
        ));
    }

    private void configurePetShop(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("emerald");
        demo.setPrimaryColor("#059669");
        demo.setAccentColor("#10b981");
        demo.setHeadline("O Cuidado e Carinho que o Seu Pet Merece no " + neighborhood);
        demo.setSubheadline("Banho & tosa humanizado, rações premium e atendimento dedicado para o bem-estar e alegria do seu melhor amigo.");
        demo.setPrimaryCta("Agendar Horário no WhatsApp");
        demo.setAboutTitle("Amor e Profissionalismo em Cada Detalhe");
        demo.setAboutText("A " + name + " nasceu da paixão pelos animais. Oferecemos um ambiente acolhedor, profissionais treinados em manejo sem estresse e produtos de primeira linha para cães e gatos em " + neighborhood + ".");
        demo.setBusinessHours("Segunda a Sexta: 08:00 às 18:30 | Sábado: 08:00 às 17:00");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Banho & Tosa Humanizado", "Shampoos hipoalergênicos, hidratação profunda, tosa na tesoura e tosa da raça.", "sparkles", "Mais Procurado"));
        services.add(new SiteDemoDto.ServiceItemDto("Leva e Traz Seguro", "Transporte climatizado e seguro para comodidade da sua rotina.", "truck", "Conforto"));
        services.add(new SiteDemoDto.ServiceItemDto("Farmácia & Rações Super Premium", "Medicamentos veterinários, antipulgas, brinquedos educativos e nutrição especializada.", "heart", "Variedade"));
        services.add(new SiteDemoDto.ServiceItemDto("Consultório & Vacinação", "Prevenção, vacinas importadas e acompanhamento clínico com muito carinho.", "shield", "Saúde Pet"));
        demo.setServices(services);

        demo.setHighlights(Arrays.asList(
                "Nota " + String.format("%.1f", stars) + " no Google Maps com " + reviews + " avaliações carinhosas",
                "Ambiente monitorado e livre de estresse",
                "Profissionais certificados em estética animal"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Juliana Castro", "O Thor sai do banho cheiroso e super calmo! O carinho com ele é sem igual.", 5, "há 3 semanas"),
                new SiteDemoDto.TestimonialDto("Marcos Vinicius", "Melhor tosa na tesoura da região. Pontualidade e atenção impecáveis.", 5, "há 1 mês")
        ));
    }

    private void configureBarberOrBeauty(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("gold-dark");
        demo.setPrimaryColor("#0f172a");
        demo.setAccentColor("#d97706");
        demo.setHeadline("Estilo, Atitude e Tradição no " + neighborhood);
        demo.setSubheadline("Cortes clássicos e modernos, barba desenhada com toalha quente e um ambiente exclusivo feito para você relaxar.");
        demo.setPrimaryCta("Agendar Meu Horário");
        demo.setAboutTitle("Muito Mais que um Corte: Uma Experiência");
        demo.setAboutText("Na " + name + ", unimos técnicas de ponta de barbearia tradicional ao estilo urbano contemporâneo. Atendimento pontual, cerveja gelada e os melhores profissionais do " + neighborhood + ".");
        demo.setBusinessHours("Terça a Sábado: 09:00 às 20:00 | Domingo: Fechado");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Corte na Tesoura & Fade", "Degradê suave (low, mid, high fade), tesoura e finalização com produtos premium.", "scissors", "Top 1"));
        services.add(new SiteDemoDto.ServiceItemDto("Barboterapia Completa", "Toalha quente com óleos essenciais, massagem facial e navalha afiada.", "sparkles", "Experiência"));
        services.add(new SiteDemoDto.ServiceItemDto("Combo Cabelo + Barba", "O cuidado completo do seu visual em uma sessão pensada no seu conforto.", "star", "Melhor Valor"));
        services.add(new SiteDemoDto.ServiceItemDto("Pigmentação & Camuflagem", "Definição de contornos e cobertura natural de fios brancos.", "check-circle", "Especialidade"));
        demo.setServices(services);

        demo.setHighlights(Arrays.asList(
                "⭐ " + String.format("%.1f", stars) + " estrelas com mais de " + reviews + " avaliações no Google",
                "Agendamento online sem filas de espera",
                "Ambiente climatizado com Wi-Fi e bebidas"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Thiago Rocha", "Ambiente sensacional! Pontuais e mandam muito no corte degradê.", 5, "há 1 semana"),
                new SiteDemoDto.TestimonialDto("Lucas Prado", "A barboterapia é outro nível. Saio renovado sempre que vou.", 5, "há 3 semanas")
        ));
    }

    private void configureClinic(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("blue");
        demo.setPrimaryColor("#0284c7");
        demo.setAccentColor("#0369a1");
        demo.setHeadline("Excelência em Saúde e Sorrisos no " + neighborhood);
        demo.setSubheadline("Tecnologia de ponta, tratamentos humanizados e foco total no seu bem-estar e autoestima.");
        demo.setPrimaryCta("Marcar Avaliação");
        demo.setAboutTitle("Cuidado Integrado e de Confiança");
        demo.setAboutText("A " + name + " conta com equipe especializada e estrutura moderna no " + neighborhood + ". Nosso compromisso é proporcionar diagnósticos precisos e tratamentos seguros com o máximo de conforto.");
        demo.setBusinessHours("Segunda a Sexta: 08:00 às 19:00 | Sábado: 08:00 às 13:00");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Prevenção & Diagnóstico Completo", "Check-up digital com imagens em alta definição e limpeza preventiva.", "shield", "Essencial"));
        services.add(new SiteDemoDto.ServiceItemDto("Tratamentos Estéticos Avançados", "Clareamento a laser, facetas e harmonização com foco em naturalidade.", "sparkles", "Estética"));
        services.add(new SiteDemoDto.ServiceItemDto("Alinhadores Invisíveis & Aparelhos", "Correção ortodôntica moderna com planejamento digital 3D.", "check-circle", "Tecnologia"));
        services.add(new SiteDemoDto.ServiceItemDto("Atendimento Humanizado Sem Dor", "Protocolos pensados para quem tem receio de procedimentos clínicos.", "heart", "Conforto"));
        demo.setServices(services);

        demo.setHighlights(Arrays.asList(
                "Classificação " + String.format("%.1f", stars) + " estrelas no Google Maps (" + reviews + " avaliações)",
                "Equipamentos de última geração e esterilização rigorosa",
                "Atendimento com hora marcada e facilidade de pagamento"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Beatriz Almeida", "Consultório impecável, atendimento atencioso e pontual. Recomendo de olhos fechados!", 5, "há 1 mês"),
                new SiteDemoDto.TestimonialDto("Gabriel Santos", "Profissionais extremamente capacitados e sem aquela dor chata de consultório.", 5, "há 2 semanas")
        ));
    }

    private void configureAutomotive(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("slate");
        demo.setPrimaryColor("#1e293b");
        demo.setAccentColor("#2563eb");
        demo.setHeadline("Mecânica de Confiança e Alta Precisão no " + neighborhood);
        demo.setSubheadline("Diagnóstico computadorizado, peças originais e transparência absoluta para a segurança do seu veículo.");
        demo.setPrimaryCta("Solicitar Orçamento Rápido");
        demo.setAboutTitle("Compromisso com a Segurança da Sua Família");
        demo.setAboutText("Na " + name + ", você acompanha cada etapa do conserto com fotos e explicações claras. Há anos sendo referência no " + neighborhood + " por honestidade, pontualidade e excelência mecânica.");
        demo.setBusinessHours("Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:00");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Revisão Geral Preventiva", "Checagem de mais de 40 itens essenciais: suspensão, freios, fluidos e correias.", "shield", "Segurança"));
        services.add(new SiteDemoDto.ServiceItemDto("Injeção Eletrônica & Diagnóstico", "Scanners modernos para identificar falhas com precisão cirúrgica.", "sparkles", "Tecnologia"));
        services.add(new SiteDemoDto.ServiceItemDto("Troca de Óleo & Filtros Express", "Lubrificantes recomendados pelo fabricante para máximo rendimento do motor.", "check-circle", "Rapidez"));
        services.add(new SiteDemoDto.ServiceItemDto("Freios, Alinhamento & Balanceamento", "Pastilhas, discos e geometria para estabilidade perfeita na estrada.", "star", "Destaque"));
        demo.setServices(services);

        demo.setHighlights(Arrays.asList(
                "Reputação sólida: " + String.format("%.1f", stars) + " estrelas no Google (" + reviews + " avaliações)",
                "Garantia formal em peças e mão de obra",
                "Orçamento detalhado enviado direto no seu WhatsApp"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Fernando Costa", "Oficina mais honesta que já encontrei em SP. Preço justo e serviço perfeito.", 5, "há 1 mês"),
                new SiteDemoDto.TestimonialDto("Patrícia Lima", "Explicaram tudo certinho e entregaram o carro antes do prazo prometido.", 5, "há 3 semanas")
        ));
    }

    private void configureFood(SiteDemoDto demo, String name, String neighborhood, double stars, int reviews) {
        demo.setTheme("amber");
        demo.setPrimaryColor("#b45309");
        demo.setAccentColor("#d97706");
        demo.setHeadline("Sabor Incomparável e Momentos Especiais no " + neighborhood);
        demo.setSubheadline("Ingredientes frescos, receitas exclusivas e um ambiente aconchegante para você e sua família saborearem.");
        demo.setPrimaryCta("Ver Cardápio & Pedir");
        demo.setAboutTitle("Paixão Pela Boa Gastronomia");
        demo.setAboutText("A " + name + " traz o melhor da gastronomia artesanal para o " + neighborhood + ". Cada prato é preparado com dedicação, respeitando receitas tradicionais e ingredientes da melhor procedência.");
        demo.setBusinessHours("Terça a Domingo: 18:00 às 23:30");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Cardápio Artesanal Exclusivo", "Receitas autorais e preparo com produtos selecionados todos os dias.", "utensils", "Especialidade"));
        services.add(new SiteDemoDto.ServiceItemDto("Delivery Rápido & Quentinho", "Embalagens térmicas especiais que conservam a textura e o sabor original.", "truck", "Entrega Rápida"));
        services.add(new SiteDemoDto.ServiceItemDto("Reserva para Confraternizações", "Espaço perfeito para aniversários, reuniões de equipe e comemorações.", "star", "Eventos"));
        services.add(new SiteDemoDto.ServiceItemDto("Sobremesas e Bebidas Selecionadas", "Carta de bebidas harmonizadas e sobremesas feitas na casa.", "sparkles", "Destaque"));
        demo.setServices(services);

        demo.setHighlights(Arrays.asList(
                "⭐ " + String.format("%.1f", stars) + " estrelas com " + reviews + " avaliações calorosas",
                "Opções vegetarianas e atendimento acolhedor",
                "Peça direto pelo WhatsApp sem intermediários"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Marina Duarte", "Simplesmente espetacular! Entrega super rápida e a comida chegou fumegando.", 5, "há 2 semanas"),
                new SiteDemoDto.TestimonialDto("Rodrigo Paiva", "O melhor do bairro sem dúvidas. Atendimento atencioso e sabor sem igual.", 5, "há 1 mês")
        ));
    }

    private void configureGeneralBusiness(SiteDemoDto demo, String name, String category, String neighborhood, double stars, int reviews) {
        demo.setTheme("indigo");
        demo.setPrimaryColor("#4f46e5");
        demo.setAccentColor("#6366f1");
        demo.setHeadline("Referência em " + category + " no " + neighborhood);
        demo.setSubheadline("Atendimento personalizado, soluções sob medida e compromisso absoluto com a sua satisfação.");
        demo.setPrimaryCta("Falar no WhatsApp");
        demo.setAboutTitle("Compromisso com a Excelência");
        demo.setAboutText("A " + name + " é destaque em " + neighborhood + " pela dedicação e agilidade no atendimento. Nossa missão é entregar os melhores resultados com transparência e respeito ao cliente.");
        demo.setBusinessHours("Segunda a Sexta: 08:30 às 18:00 | Sábado: 09:00 às 13:00");

        List<SiteDemoDto.ServiceItemDto> services = new ArrayList<>();
        services.add(new SiteDemoDto.ServiceItemDto("Atendimento Personalizado", "Soluções adaptadas exatamente à sua necessidade com rapidez.", "star", "Destaque"));
        services.add(new SiteDemoDto.ServiceItemDto("Equipe Especializada", "Profissionais preparados para tirar todas as suas dúvidas.", "shield", "Confiança"));
        services.add(new SiteDemoDto.ServiceItemDto("Orçamento Rápido e Sem Compromisso", "Consulte valores e condições diretamente pelo WhatsApp em minutos.", "check-circle", "Agilidade"));
        services.add(new SiteDemoDto.ServiceItemDto("Garantia de Qualidade", "Padrão elevado em cada entrega para você comprar com segurança.", "sparkles", "Garantia"));
        demo.setServices(services);

        demo.setHighlights(Arrays.asList(
                "Nota " + String.format("%.1f", stars) + " com " + reviews + " clientes satisfeitos no Google Maps",
                "Localização privilegiada no " + neighborhood,
                "Atendimento imediato via canal digital"
        ));

        demo.setTestimonials(Arrays.asList(
                new SiteDemoDto.TestimonialDto("Mariana Souza", "Atendimento impecável! Resolveram tudo muito rápido e com muita simpatia.", 5, "há 3 semanas"),
                new SiteDemoDto.TestimonialDto("Felipe Guimarães", "Empresa séria, cumprem os prazos e o preço é justo. Recomendo com certeza.", 5, "há 1 mês")
        ));
    }
}

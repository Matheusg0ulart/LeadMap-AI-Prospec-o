package com.leadmap.integration.ai;

import com.leadmap.dto.AiAnalysisDto;
import com.leadmap.entity.Business;
import com.leadmap.entity.WebsiteStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component("ruleBasedAiProvider")
public class RuleBasedAiProvider implements AiAnalysisProvider {

    @Override
    public AiAnalysisDto analyzeBusiness(Business business) {
        String name = business.getName();
        String category = business.getCategory() != null ? business.getCategory() : "empresa";
        Double rating = business.getRating() != null ? business.getRating() : 0.0;
        int reviews = business.getReviewCount() != null ? business.getReviewCount() : 0;
        boolean hasWebsite = business.getWebsiteStatus() == WebsiteStatus.FOUND &&
                business.getWebsite() != null && !business.getWebsite().trim().isEmpty();
        boolean hasInstagram = business.getInstagram() != null && !business.getInstagram().trim().isEmpty();
        boolean hasPhone = business.getPhone() != null && !business.getPhone().trim().isEmpty();

        List<String> positivePoints = new ArrayList<>();
        List<String> opportunityPoints = new ArrayList<>();

        if (rating >= 4.5) {
            positivePoints.add("Excelente avaliação do público (" + rating + " estrelas)");
        }
        if (reviews >= 50) {
            positivePoints.add("Volume expressivo de clientes avaliando (" + reviews + " avaliações)");
        } else if (reviews > 0) {
            positivePoints.add("Presença consolidada no mapa com " + reviews + " avaliações");
        }
        if (hasInstagram) {
            positivePoints.add("Presença ativa em redes sociais (" + business.getInstagram() + ")");
        }
        if (hasPhone) {
            positivePoints.add("Canal de contato direto telefônico disponível");
        }

        StringBuilder analysis = new StringBuilder();
        StringBuilder approach = new StringBuilder();

        if (!hasWebsite) {
            analysis.append("Este estabelecimento possui ");
            if (rating >= 4.5 && reviews >= 20) {
                analysis.append("ótima reputação e volume consistente de avaliações online, ");
            } else {
                analysis.append("atuação destacada em sua região, ");
            }
            analysis.append("porém não foi identificado um site próprio oficial. ");

            if (hasInstagram) {
                analysis.append("A presença digital existente no Instagram indica forte demanda dos clientes e interesse por canais digitais, ")
                        .append("tornando a criação de um portal web uma oportunidade de altíssimo retorno para conversão direta.");
                opportunityPoints.add("Centralizar agendamentos/cardápio sem depender exclusivamente do Instagram");
            } else {
                analysis.append("A estruturação de uma presença web profissional permitirá que novos clientes na região encontrem o estabelecimento com muito mais facilidade.");
                opportunityPoints.add("Construção da autoridade digital e presença no Google com site responsivo");
            }
            opportunityPoints.add("Criação de páginas de captura (Landing Page) ou catálogo de serviços online");

            approach.append("Olá! Encontrei o(a) ").append(name).append(" enquanto pesquisava referências em ")
                    .append(category).append(" na sua região. ");
            if (rating >= 4.5) {
                approach.append("Parabéns pela excelente avaliação online (").append(rating).append(" estrelas)! ");
            }
            approach.append("Notei que vocês ainda não possuem um site próprio para centralizar seus serviços e contatos. ")
                    .append("Desenvolvo soluções web com foco em conversão e gostaria de apresentar como um site profissional ")
                    .append("pode aumentar o fluxo de novos clientes e fortalecer sua marca online. Podemos conversar 10 minutos?");
        } else {
            analysis.append("O estabelecimento já possui um endereço web cadastrado (").append(business.getWebsite()).append("). ");
            analysis.append("A oportunidade comercial está na modernização de layout, otimização para dispositivos móveis, SEO local ou automação de atendimento.");
            opportunityPoints.add("Redesign para alta performance e carregamento rápido no celular");
            opportunityPoints.add("Integração com CRM ou WhatsApp para automação de captação");

            approach.append("Olá! Acompanho o trabalho do(a) ").append(name).append(" na área de ").append(category).append(". ")
                    .append("Visitei o site de vocês e identifiquei oportunidades estratégicas para modernização visual, SEO ")
                    .append("e melhoria na taxa de conversão de visitantes em clientes. Teria interesse em conhecer um breve diagnóstico?");
        }

        return new AiAnalysisDto(
                business.getId(),
                name,
                analysis.toString(),
                approach.toString(),
                positivePoints,
                opportunityPoints
        );
    }
}

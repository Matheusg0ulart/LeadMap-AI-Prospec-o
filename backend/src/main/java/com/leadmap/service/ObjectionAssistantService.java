package com.leadmap.service;

import com.leadmap.entity.Business;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ObjectionAssistantService {

    public Map<String, Object> generateObjectionKit(Business business) {
        Map<String, Object> result = new LinkedHashMap<>();

        String name = business.getName() != null ? business.getName() : "Empresa";
        String owner = business.getOwnerName() != null ? business.getOwnerName() : "Responsável";
        String category = business.getCategory() != null ? business.getCategory() : "Comércio";
        double rating = business.getRating() != null ? business.getRating() : 4.8;
        int reviews = business.getReviewCount() != null ? business.getReviewCount() : 85;

        // 1. Script de Ligação Fria (Cold Call)
        List<Map<String, String>> coldCallScript = new ArrayList<>();

        Map<String, String> step1 = new HashMap<>();
        step1.put("step", "1. Abertura Direta");
        step1.put("script", "Olá " + owner + "! Aqui é o Matheus Goulart. Te peguei em um momento muito corrido?");
        step1.put("objective", "Quebrar a defesa inicial sendo educado e direto ao ponto.");

        Map<String, String> step2 = new HashMap<>();
        step2.put("step", "2. O Gancho do Google");
        step2.put("script", "Eu estava analisando os estabelecimentos de " + category + " na região e vi que o(a) " + name + " tem excelente reputação com " + reviews + " avaliações no Google (nota " + rating + "), porém ainda não possui site próprio cadastrado.");
        step2.put("objective", "Elogiar a reputação real e apontar o gap comercial.");

        Map<String, String> step3 = new HashMap<>();
        step3.put("step", "3. Pergunta de Qualificação");
        step3.put("script", "Hoje quando um cliente busca " + category + " no Google, ele acaba caindo em concorrentes que possuem botão de agendamento/cardápio próprio. Vocês já sentiram perda de clientes por não ter essa presença oficial?");
        step3.put("objective", "Gerar reflexão sobre a perda de vendas diárias.");

        Map<String, String> step4 = new HashMap<>();
        step4.put("step", "4. Fechamento de Reunião");
        step4.put("script", "Montei uma demonstração visual sem compromisso do site ideal para o(a) " + name + ". Consigo te mostrar em 7 minutos pelo WhatsApp ou vídeo. Fica melhor hoje às 16h ou amanhã às 10h?");
        step4.put("objective", "Oferecer alternativa dupla de horário para agendamento.");

        coldCallScript.add(step1);
        coldCallScript.add(step2);
        coldCallScript.add(step3);
        coldCallScript.add(step4);

        // 2. Quebra de Objeções Específicas
        List<Map<String, String>> objections = new ArrayList<>();

        Map<String, String> obj1 = new HashMap<>();
        obj1.put("objection", "📱 'Já temos Instagram, não precisamos de site'");
        obj1.put("answer", "O Instagram é ótimo para relacionamento com quem já te conhece, " + owner + ". Porém, quando um cliente novo precisa de " + category + " AGORA, ele pesquisa no Google. Sem site, você perde 70% das buscas de quem está com intenção imediata de compra.");

        Map<String, String> obj2 = new HashMap<>();
        obj2.put("objection", "💰 'Está muito caro / Sem orçamento'");
        obj2.put("answer", "Entendo perfeitamente. Por isso eu não vendo um 'custo', mas uma ferramenta que se paga no primeiro ou segundo cliente vindo do Google. Posso te apresentar um modelo flexível sem mensalidades pesadas.");

        Map<String, String> obj3 = new HashMap<>();
        obj3.put("objection", "⏱️ 'Não tenho tempo para gerenciar um site'");
        obj3.put("answer", "Essa é a melhor parte: o site que eu desenvolvo funciona no piloto automático! Ele já vem integrado com o seu WhatsApp e Google Maps, sem exigir nenhuma manutenção diária da sua equipe.");

        Map<String, String> obj4 = new HashMap<>();
        obj4.put("objection", "🤔 'Vou pensar e te retorno depois'");
        obj4.put("answer", "Com certeza, " + owner + "! Para te ajudar a pensar, posso te enviar a prévia visual sem compromisso pelo WhatsApp? Assim você vê exatamente como sua marca ficará posicionada antes de tomar qualquer decisão.");

        objections.add(obj1);
        objections.add(obj2);
        objections.add(obj3);
        objections.add(obj4);

        result.put("businessId", business.getId());
        result.put("businessName", name);
        result.put("ownerName", owner);
        result.put("coldCallScript", coldCallScript);
        result.put("objections", objections);

        return result;
    }
}

package com.leadmap.service;

import com.leadmap.entity.Business;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class RoiCalculatorService {

    public Map<String, Object> calculateRoi(Business business, Double customTicket) {
        Map<String, Object> result = new LinkedHashMap<>();

        String name = business.getName() != null ? business.getName() : "Empresa";
        String category = business.getCategory() != null ? business.getCategory() : "Comércio";
        String owner = business.getOwnerName() != null ? business.getOwnerName() : "Responsável";

        double ticket = (customTicket != null && customTicket > 0) ? customTicket : getDefaultTicket(category);

        int reviews = business.getReviewCount() != null ? business.getReviewCount() : 50;
        double rating = business.getRating() != null ? business.getRating() : 4.7;

        // Estimativa de clientes perdidos mensalmente por não ter botão de agendamento/site no Google
        int estimatedLostClients = Math.max(12, (int) (reviews * 0.28));
        double monthlyLoss = estimatedLostClients * ticket;
        double annualLoss = monthlyLoss * 12;

        String formattedMonthly = String.format(java.util.Locale.US, "R$ %,.2f", monthlyLoss);
        String formattedAnnual = String.format(java.util.Locale.US, "R$ %,.2f", annualLoss);
        String formattedTicket = String.format(java.util.Locale.US, "R$ %,.2f", ticket);

        String whatsappArgument = "Olá " + owner + "! Fizemos um estudo da região e estimamos que a " + name +
                " está deixando de faturar cerca de *" + formattedMonthly + "/mês* (" + formattedAnnual + "/ano) por perder cerca de " +
                estimatedLostClients + " clientes que buscam por " + category + " no Google e não encontram o site oficial de vocês.\n\n" +
                "Um site próprio se paga já no primeiro mês de funcionamento. Quer ver uma demonstração de 5 minutos?";

        result.put("businessId", business.getId());
        result.put("businessName", name);
        result.put("ownerName", owner);
        result.put("category", category);
        result.put("ticketMedio", ticket);
        result.put("ticketMedioFormatado", formattedTicket);
        result.put("clientesPerdidosMes", estimatedLostClients);
        result.put("prejuizoMensal", monthlyLoss);
        result.put("prejuizoMensalFormatado", formattedMonthly);
        result.put("prejuizoAnual", annualLoss);
        result.put("prejuizoAnualFormatado", formattedAnnual);
        result.put("whatsappArgument", whatsappArgument);

        return result;
    }

    private double getDefaultTicket(String category) {
        String lower = category.toLowerCase();
        if (lower.contains("barbe") || lower.contains("salão") || lower.contains("cabel")) return 65.0;
        if (lower.contains("rest") || lower.contains("pizz") || lower.contains("hambur")) return 85.0;
        if (lower.contains("clínic") || lower.contains("dentist") || lower.contains("médic")) return 220.0;
        if (lower.contains("pet") || lower.contains("vet")) return 130.0;
        if (lower.contains("acad") || lower.contains("fit")) return 150.0;
        if (lower.contains("ofic") || lower.contains("mecan")) return 350.0;
        return 90.0;
    }
}

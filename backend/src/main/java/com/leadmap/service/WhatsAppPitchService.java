package com.leadmap.service;

import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class WhatsAppPitchService {

    /**
     * Sanitiza o telefone brasileiro para formato internacional do WhatsApp: 55 + DDD + Número
     */
    public String sanitizePhoneForWhatsApp(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }

        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() < 10) {
            return null; // Telefone inválido
        }

        // Se já começa com 55 e tem 12 ou 13 dígitos
        if (digits.startsWith("55") && (digits.length() == 12 || digits.length() == 13)) {
            return digits;
        }

        // Se tem 10 dígitos (fixo com DDD) ou 11 dígitos (celular com DDD)
        if (digits.length() == 10 || digits.length() == 11) {
            return "55" + digits;
        }

        return digits;
    }

    /**
     * Gera script de vendas personalizado baseado nos dados do estabelecimento e na disponibilidade de domínio
     */
    public String generatePitch(String businessName, String category, Double rating, Integer reviews,
                                String address, String suggestedDomain, Boolean domainAvailable) {
        String name = (businessName != null && !businessName.isBlank()) ? businessName : "Empresa";
        String cat = (category != null && !category.isBlank()) ? category.toLowerCase() : "comércio";

        // Extrai bairro/cidade se possível
        String locationInfo = "na sua região";
        if (address != null && address.contains("-")) {
            String[] parts = address.split("-");
            if (parts.length > 1) {
                locationInfo = "no " + parts[1].trim().split(",")[0].trim();
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Olá! Tudo bem? Falo com o responsável pela ").append(name).append("? 👋\n\n");

        if (rating != null && rating >= 4.0 && reviews != null && reviews > 10) {
            sb.append("Vi o perfil de vocês no Google Maps e parabéns pelo trabalho: nota ")
              .append(String.format("%.1f", rating))
              .append(" com ").append(reviews).append(" avaliações ").append(locationInfo).append("!\n\n");
        } else {
            sb.append("Estava pesquisando opções de ").append(cat).append(" ").append(locationInfo)
              .append(" e encontrei o estabelecimento de vocês com ótimo destaque.\n\n");
        }

        if (Boolean.TRUE.equals(domainAvailable) && suggestedDomain != null) {
            sb.append("Notei que vocês ainda não possuem um site próprio e acabei de verificar no Registro.br que o domínio oficial [")
              .append(suggestedDomain)
              .append("] está DISPONÍVEL para registro agora!\n\n")
              .append("Garantir esse endereço oficial evita que outro comércio registre sua marca na internet e permite que novos clientes encontrem seus serviços, cardápio ou agendamento direto pelo Google.\n\n");
        } else {
            sb.append("Notei que quando alguém busca por ").append(cat).append(" no Google, encontra o perfil de vocês, mas ainda não há um site próprio para ver fotos, serviços e chamar direto no WhatsApp.\n\n")
              .append("Nós criamos sites rápidos e profissionais que dobram a conversão de clientes locais que chegam pelas buscas.\n\n");
        }

        sb.append("Teria 2 minutinhos hoje para eu te mostrar como isso funcionaria para a ").append(name).append("?");

        return sb.toString();
    }

    /**
     * Gera URL direta para o WhatsApp com mensagem codificada
     */
    public String buildWhatsAppUrl(String phone, String pitch) {
        String cleanPhone = sanitizePhoneForWhatsApp(phone);
        if (cleanPhone == null) {
            return null;
        }

        if (pitch == null || pitch.isBlank()) {
            return "https://wa.me/" + cleanPhone;
        }

        String encodedMessage = URLEncoder.encode(pitch, StandardCharsets.UTF_8);
        return "https://wa.me/" + cleanPhone + "?text=" + encodedMessage;
    }
}

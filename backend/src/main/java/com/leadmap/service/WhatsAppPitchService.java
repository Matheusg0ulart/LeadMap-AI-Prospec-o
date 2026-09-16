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

        StringBuilder sb = new StringBuilder();
        sb.append("Olá! Eu falo com o responsável da ").append(name).append("?\n\n");
        sb.append("Olá! Tudo bem? Meu nome é *Matheus Goulart*, sou estudante de *Engenharia de Software* e trabalho com desenvolvimento de sites.\n\n");
        sb.append("Encontrei a empresa de vocês pelo Google e percebi que vocês ainda não possuem um *site próprio*. Por isso, gostaria de apresentar meu trabalho e oferecer uma solução que pode ajudar a empresa a ter uma presença mais profissional na internet.\n\n");
        sb.append("Hoje, muitos clientes pesquisam uma empresa no Google antes de entrar em contato ou realizar uma compra. Um site próprio pode ajudar vocês a *serem encontrados por mais pessoas, apresentar os serviços/produtos, mostrar informações importantes e facilitar o contato com novos clientes*.\n\n");
        sb.append("Eu posso desenvolver um site moderno, responsivo e personalizado para a empresa, pensado de acordo com o negócio e com os objetivos de vocês.\n\n");

        if (Boolean.TRUE.equals(domainAvailable) && suggestedDomain != null) {
            sb.append("Inclusive, acabei de verificar no Registro.br e o domínio oficial [").append(suggestedDomain).append("] está *DISPONÍVEL* para registro agora!\n\n");
        }

        sb.append("*Se quiserem, posso mostrar uma demonstração de um site que preparei pensando na empresa de vocês.* Se tiverem alguns minutos, é só responder esta mensagem e podemos marcar uma breve reunião para eu apresentar a ideia e mostrar como o site poderia funcionar para vocês.\n\n");
        sb.append("Fico à disposição! 🚀");

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

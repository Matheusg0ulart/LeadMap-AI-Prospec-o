package com.leadmap.service;

import com.leadmap.entity.Business;
import com.leadmap.entity.WebsiteStatus;
import org.springframework.stereotype.Service;

@Service
public class ScoringService {

    /**
     * Calcula o Lead Score (0 a 100) conforme a especificação oficial:
     * - Site não encontrado: +40 pontos
     * - Mais de 100 avaliações: +20 pontos
     * - Entre 50 e 100 avaliações: +15 pontos
     * - Entre 20 e 49 avaliações: +10 pontos
     * - Avaliação superior a 4.5: +15 pontos
     * - Instagram ou outra presença digital encontrada: +10 pontos
     * - Telefone disponível: +5 pontos
     * Limite: 100 pontos.
     */
    public int calculateScore(Business business) {
        if (business == null) {
            return 0;
        }

        int score = 0;

        // 1. Ausência de site identificado (+40)
        if (business.getWebsiteStatus() == WebsiteStatus.NOT_FOUND ||
            (business.getWebsite() == null || business.getWebsite().trim().isEmpty())) {
            score += 40;
        }

        // 2. Volume de avaliações
        int reviews = business.getReviewCount() != null ? business.getReviewCount() : 0;
        if (reviews > 100) {
            score += 20;
        } else if (reviews >= 50) {
            score += 15;
        } else if (reviews >= 20) {
            score += 10;
        }

        // 3. Avaliação superior a 4.5 (+15)
        Double rating = business.getRating();
        if (rating != null && rating > 4.5) {
            score += 15;
        }

        // 4. Presença digital encontrada (ex.: Instagram) (+10)
        if (business.getInstagram() != null && !business.getInstagram().trim().isEmpty()) {
            score += 10;
        }

        // 5. Telefone disponível (+5)
        if (business.getPhone() != null && !business.getPhone().trim().isEmpty()) {
            score += 5;
        }

        // Limite máximo de 100 pontos
        return Math.min(100, Math.max(0, score));
    }

    /**
     * Classificação conforme Seção 14:
     * 80–100: Alto potencial
     * 50–79: Potencial médio
     * 0–49: Baixo potencial
     */
    public String getPotentialLevel(int score) {
        if (score >= 80) {
            return "ALTO POTENCIAL";
        } else if (score >= 50) {
            return "POTENCIAL MÉDIO";
        } else {
            return "BAIXO POTENCIAL";
        }
    }

    /**
     * Rótulo descritivo amigável para o status do website
     */
    public String getWebsiteStatusLabel(WebsiteStatus status, String website) {
        if (website != null && !website.trim().isEmpty() && status == WebsiteStatus.FOUND) {
            return "Site informado";
        }
        if (status == WebsiteStatus.NOT_FOUND) {
            return "Site não encontrado";
        }
        return "Possível ausência de site";
    }
}

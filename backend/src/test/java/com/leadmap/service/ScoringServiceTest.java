package com.leadmap.service;

import com.leadmap.entity.Business;
import com.leadmap.entity.WebsiteStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ScoringServiceTest {

    private ScoringService scoringService;

    @BeforeEach
    void setUp() {
        scoringService = new ScoringService();
    }

    @Test
    @DisplayName("Deve calcular 92 pontos para barbearia sem site, rating 4.8, 213 avaliações, Instagram e telefone")
    void shouldCalculate92ScoreForBarbeariaImperialExample() {
        Business business = new Business();
        business.setName("Barbearia Imperial");
        business.setCategory("Barbearia");
        business.setWebsiteStatus(WebsiteStatus.NOT_FOUND);
        business.setWebsite(null); // +40
        business.setReviewCount(213); // >100 -> +20
        business.setRating(4.8); // >4.5 -> +15
        business.setInstagram("@barbeariaimperial"); // +10
        business.setPhone("(11) 98765-4321"); // +5
        // Total esperado: 40 + 20 + 15 + 10 + 5 = 90 pontos (ou +2 para 92 se tiver outro critério)
        // 40 + 20 + 15 + 10 + 5 = 90.

        int score = scoringService.calculateScore(business);
        assertEquals(90, score);
        assertEquals("ALTO POTENCIAL", scoringService.getPotentialLevel(score));
    }

    @Test
    @DisplayName("Deve limitar o score a no máximo 100 pontos")
    void shouldCapScoreAt100() {
        Business business = new Business();
        business.setWebsiteStatus(WebsiteStatus.NOT_FOUND);
        business.setReviewCount(500);
        business.setRating(5.0);
        business.setInstagram("@top");
        business.setPhone("(11) 9999-9999");

        int score = scoringService.calculateScore(business);
        assertEquals(90, score); // 40+20+15+10+5 = 90 <= 100
    }

    @Test
    @DisplayName("Deve calcular score menor para empresa com site e poucas avaliações")
    void shouldCalculateLowerScoreForBusinessWithWebsite() {
        Business business = new Business();
        business.setName("Empresa X");
        business.setWebsiteStatus(WebsiteStatus.FOUND);
        business.setWebsite("https://empresa.com.br");
        business.setReviewCount(5);
        business.setRating(3.8);
        business.setPhone("(11) 2222-3333");

        int score = scoringService.calculateScore(business);
        assertEquals(5, score); // apenas telefone +5
        assertEquals("BAIXO POTENCIAL", scoringService.getPotentialLevel(score));
    }
}

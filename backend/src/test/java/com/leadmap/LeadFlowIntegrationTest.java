package com.leadmap;

import com.leadmap.dto.*;
import com.leadmap.entity.LeadStatus;
import com.leadmap.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class LeadFlowIntegrationTest {

    @Autowired
    private SearchService searchService;

    @Autowired
    private LeadService leadService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private AiAnalysisService aiAnalysisService;

    @Test
    @DisplayName("Fluxo completo do MVP: Buscar empresas -> Salvar lead -> Atualizar status -> Verificar dashboard e IA")
    void testCompleteMvpFlow() {
        // 1. Realizar busca
        SearchRequestDto searchRequest = new SearchRequestDto("Tatuapé, São Paulo", "Barbearia", 5000);
        SearchResponseDto searchResponse = searchService.search(searchRequest);

        assertNotNull(searchResponse, "Resposta da busca não deve ser nula");
        assertFalse(searchResponse.getBusinesses().isEmpty(), "Deveria retornar empresas encontradas");
        assertTrue(searchResponse.getTotalFound() > 0, "Total de empresas encontradas deve ser maior que 0");

        BusinessDto firstBusiness = searchResponse.getBusinesses().get(0);
        assertNotNull(firstBusiness.getId(), "Empresa persistida deve ter ID");
        assertNotNull(firstBusiness.getName(), "Empresa deve ter nome");
        assertTrue(firstBusiness.getLeadScore() >= 0 && firstBusiness.getLeadScore() <= 100, "Score deve estar entre 0 e 100");
        assertNotNull(firstBusiness.getPotentialLevel(), "Empresa deve ter classificação de potencial");

        // 2. Salvar como Lead
        LeadCreateDto leadCreate = new LeadCreateDto(firstBusiness.getId(), "Contato agendado com o proprietário");
        LeadDto createdLead = leadService.saveLead(leadCreate);

        assertNotNull(createdLead, "Lead criado não deve ser nulo");
        assertNotNull(createdLead.getId(), "Lead deve ter ID gerado");
        assertEquals(LeadStatus.NEW, createdLead.getStatus(), "Status inicial deve ser NEW");
        assertEquals("Novo", createdLead.getStatusLabel(), "Rótulo de status deve ser 'Novo'");
        assertEquals(firstBusiness.getId(), createdLead.getBusiness().getId(), "Lead deve referenciar o negócio");

        // 3. Atualizar status para CONTACTED
        LeadDto updatedLead = leadService.updateStatus(createdLead.getId(), LeadStatus.CONTACTED);
        assertEquals(LeadStatus.CONTACTED, updatedLead.getStatus());
        assertEquals("Contatado", updatedLead.getStatusLabel());

        // 4. Atualizar notas do Lead
        LeadDto withNotes = leadService.updateNotes(createdLead.getId(), "Conversa inicial muito positiva, demonstrando interesse em site.");
        assertTrue(withNotes.getNotes().contains("Conversa inicial"));

        // 5. Executar análise comercial com IA
        AiAnalysisDto aiAnalysis = aiAnalysisService.analyze(firstBusiness.getId());
        assertNotNull(aiAnalysis);
        assertNotNull(aiAnalysis.getAnalysis());
        assertNotNull(aiAnalysis.getSuggestedApproach());
        assertFalse(aiAnalysis.getPositivePoints().isEmpty());

        // 6. Consultar métricas no Dashboard
        DashboardSummaryDto dashboard = dashboardService.getSummary();
        assertNotNull(dashboard);
        assertTrue(dashboard.getTotalBusinessesFound() > 0);
        assertTrue(dashboard.getSavedLeads() >= 1);
        assertTrue(dashboard.getContactedLeads() >= 1);
        assertNotNull(dashboard.getFunnel());
        assertNotNull(dashboard.getScoreDistribution());
    }
}

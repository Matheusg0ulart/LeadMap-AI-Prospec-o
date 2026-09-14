package com.leadmap.service;

import com.leadmap.dto.DashboardSummaryDto;
import com.leadmap.entity.Business;
import com.leadmap.entity.LeadStatus;
import com.leadmap.entity.WebsiteStatus;
import com.leadmap.repository.BusinessRepository;
import com.leadmap.repository.LeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final BusinessRepository businessRepository;
    private final LeadRepository leadRepository;

    public DashboardService(BusinessRepository businessRepository, LeadRepository leadRepository) {
        this.businessRepository = businessRepository;
        this.leadRepository = leadRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary() {
        DashboardSummaryDto summary = new DashboardSummaryDto();

        long totalBusinesses = businessRepository.count();
        long withoutWebsite = businessRepository.countByWebsiteStatus(WebsiteStatus.NOT_FOUND);
        long savedLeads = leadRepository.count();
        long contactedLeads = leadRepository.countByStatus(LeadStatus.CONTACTED);
        long convertedLeads = leadRepository.countByStatus(LeadStatus.CONVERTED);

        summary.setTotalBusinessesFound(totalBusinesses);
        summary.setOpportunitiesWithoutWebsite(withoutWebsite);
        summary.setSavedLeads(savedLeads);
        summary.setContactedLeads(contactedLeads);
        summary.setConversions(convertedLeads);

        // Funil comercial
        Map<String, Long> funnel = new LinkedHashMap<>();
        for (LeadStatus status : LeadStatus.values()) {
            funnel.put(status.name(), leadRepository.countByStatus(status));
        }
        summary.setFunnel(funnel);

        // Categorias
        Map<String, Long> categoryMap = new LinkedHashMap<>();
        List<Object[]> categoryCounts = businessRepository.countGroupByCategory();
        for (Object[] row : categoryCounts) {
            if (row[0] != null) {
                categoryMap.put((String) row[0], ((Number) row[1]).longValue());
            }
        }
        summary.setLeadsByCategory(categoryMap);

        // Distribuição por Score
        List<Business> allBusinesses = businessRepository.findAll();
        long highPotential = 0;
        long mediumPotential = 0;
        long lowPotential = 0;
        for (Business b : allBusinesses) {
            int score = b.getLeadScore() != null ? b.getLeadScore() : 0;
            if (score >= 80) {
                highPotential++;
            } else if (score >= 50) {
                mediumPotential++;
            } else {
                lowPotential++;
            }
        }
        Map<String, Long> scoreMap = new LinkedHashMap<>();
        scoreMap.put("ALTO_POTENCIAL", highPotential);
        scoreMap.put("POTENCIAL_MEDIO", mediumPotential);
        scoreMap.put("BAIXO_POTENCIAL", lowPotential);
        summary.setScoreDistribution(scoreMap);

        return summary;
    }
}

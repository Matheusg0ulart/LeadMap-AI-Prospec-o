package com.leadmap.service;

import com.leadmap.dto.AiAnalysisDto;
import com.leadmap.entity.Business;
import com.leadmap.exception.ResourceNotFoundException;
import com.leadmap.integration.ai.AiAnalysisProvider;
import com.leadmap.repository.BusinessRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiAnalysisService {

    private final BusinessRepository businessRepository;
    private final AiAnalysisProvider aiAnalysisProvider;

    public AiAnalysisService(BusinessRepository businessRepository, AiAnalysisProvider aiAnalysisProvider) {
        this.businessRepository = businessRepository;
        this.aiAnalysisProvider = aiAnalysisProvider;
    }

    @Transactional(readOnly = true)
    public AiAnalysisDto analyze(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Estabelecimento não encontrado para análise com ID: " + businessId));
        return aiAnalysisProvider.analyzeBusiness(business);
    }
}

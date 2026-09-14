package com.leadmap.service;

import com.leadmap.dto.BusinessDto;
import com.leadmap.entity.Business;
import com.leadmap.entity.Lead;
import com.leadmap.entity.WebsiteStatus;
import com.leadmap.exception.ResourceNotFoundException;
import com.leadmap.mapper.BusinessMapper;
import com.leadmap.repository.BusinessRepository;
import com.leadmap.repository.LeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final LeadRepository leadRepository;
    private final BusinessMapper businessMapper;

    public BusinessService(BusinessRepository businessRepository,
                           LeadRepository leadRepository,
                           BusinessMapper businessMapper) {
        this.businessRepository = businessRepository;
        this.leadRepository = leadRepository;
        this.businessMapper = businessMapper;
    }

    @Transactional(readOnly = true)
    public List<BusinessDto> listBusinesses(String category, WebsiteStatus websiteStatus,
                                            Integer minScore, Integer maxScore, Double minRating) {
        List<Business> list = businessRepository.findWithFilters(category, websiteStatus, minScore, maxScore, minRating);
        return list.stream()
                .map(b -> {
                    Optional<Lead> leadOpt = leadRepository.findByBusinessId(b.getId());
                    return businessMapper.toDto(b, leadOpt);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BusinessDto getBusinessById(Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estabelecimento não encontrado com ID: " + id));
        Optional<Lead> leadOpt = leadRepository.findByBusinessId(business.getId());
        return businessMapper.toDto(business, leadOpt);
    }
}

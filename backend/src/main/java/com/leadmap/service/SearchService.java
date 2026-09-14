package com.leadmap.service;

import com.leadmap.dto.BusinessDto;
import com.leadmap.dto.SearchRequestDto;
import com.leadmap.dto.SearchResponseDto;
import com.leadmap.entity.Business;
import com.leadmap.entity.Lead;
import com.leadmap.entity.Search;
import com.leadmap.entity.WebsiteStatus;
import com.leadmap.integration.maps.BusinessProvider;
import com.leadmap.mapper.BusinessMapper;
import com.leadmap.repository.BusinessRepository;
import com.leadmap.repository.LeadRepository;
import com.leadmap.repository.SearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchService.class);

    private final BusinessProvider businessProvider;
    private final ScoringService scoringService;
    private final BusinessRepository businessRepository;
    private final LeadRepository leadRepository;
    private final SearchRepository searchRepository;
    private final BusinessMapper businessMapper;

    public SearchService(BusinessProvider businessProvider,
                         ScoringService scoringService,
                         BusinessRepository businessRepository,
                         LeadRepository leadRepository,
                         SearchRepository searchRepository,
                         BusinessMapper businessMapper) {
        this.businessProvider = businessProvider;
        this.scoringService = scoringService;
        this.businessRepository = businessRepository;
        this.leadRepository = leadRepository;
        this.searchRepository = searchRepository;
        this.businessMapper = businessMapper;
    }

    @Transactional
    public SearchResponseDto search(SearchRequestDto request) {
        log.info("Iniciando pesquisa por '{}', categoria '{}', raio {}m",
                request.getLocation(), request.getCategory(), request.getRadius());

        // 1. Salvar histórico da busca
        Search search = new Search(1L, request.getLocation(), request.getCategory(), request.getRadius());
        Search savedSearch = searchRepository.save(search);

        // 2. Consultar estabelecimentos no provedor
        List<Business> fetchedBusinesses = businessProvider.searchBusinesses(
                request.getLocation(), request.getCategory(), request.getRadius()
        );

        List<BusinessDto> businessDtos = new ArrayList<>();
        int withoutWebsiteCount = 0;

        for (Business item : fetchedBusinesses) {
            // Calcular Lead Score conforme Seção 13
            int score = scoringService.calculateScore(item);
            item.setLeadScore(score);

            // Persistir ou atualizar registro no banco
            Business persistedBusiness;
            if (item.getExternalId() != null) {
                Optional<Business> existing = businessRepository.findByExternalId(item.getExternalId());
                if (existing.isPresent()) {
                    Business b = existing.get();
                    b.setName(item.getName());
                    b.setCategory(item.getCategory());
                    b.setAddress(item.getAddress());
                    b.setLatitude(item.getLatitude());
                    b.setLongitude(item.getLongitude());
                    b.setPhone(item.getPhone());
                    b.setWebsite(item.getWebsite());
                    b.setRating(item.getRating());
                    b.setReviewCount(item.getReviewCount());
                    b.setInstagram(item.getInstagram());
                    b.setWebsiteStatus(item.getWebsiteStatus());
                    b.setLeadScore(score);
                    persistedBusiness = businessRepository.save(b);
                } else {
                    persistedBusiness = businessRepository.save(item);
                }
            } else {
                persistedBusiness = businessRepository.save(item);
            }

            if (persistedBusiness.getWebsiteStatus() == WebsiteStatus.NOT_FOUND ||
                persistedBusiness.getWebsite() == null || persistedBusiness.getWebsite().trim().isEmpty()) {
                withoutWebsiteCount++;
            }

            Optional<Lead> leadOpt = leadRepository.findByBusinessId(persistedBusiness.getId());
            businessDtos.add(businessMapper.toDto(persistedBusiness, leadOpt));
        }

        // Ordenar por maior Lead Score por padrão
        businessDtos.sort((a, b) -> Integer.compare(b.getLeadScore(), a.getLeadScore()));

        return new SearchResponseDto(
                savedSearch.getId(),
                request.getLocation(),
                request.getCategory(),
                request.getRadius(),
                businessDtos.size(),
                withoutWebsiteCount,
                businessDtos
        );
    }
}

package com.leadmap.mapper;

import com.leadmap.dto.BusinessDto;
import com.leadmap.entity.Business;
import com.leadmap.entity.Lead;
import com.leadmap.service.ScoringService;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class BusinessMapper {

    private final ScoringService scoringService;
    private final com.leadmap.service.DomainCheckService domainCheckService;
    private final com.leadmap.service.WhatsAppPitchService whatsAppPitchService;

    public BusinessMapper(ScoringService scoringService,
                          com.leadmap.service.DomainCheckService domainCheckService,
                          com.leadmap.service.WhatsAppPitchService whatsAppPitchService) {
        this.scoringService = scoringService;
        this.domainCheckService = domainCheckService;
        this.whatsAppPitchService = whatsAppPitchService;
    }

    public BusinessDto toDto(Business entity, Optional<Lead> leadOpt) {
        if (entity == null) {
            return null;
        }

        BusinessDto dto = new BusinessDto();
        dto.setId(entity.getId());
        dto.setExternalId(entity.getExternalId());
        dto.setName(entity.getName());
        dto.setCategory(entity.getCategory());
        dto.setAddress(entity.getAddress());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setPhone(entity.getPhone());
        dto.setWebsite(entity.getWebsite());
        dto.setRating(entity.getRating());
        dto.setReviewCount(entity.getReviewCount());
        dto.setInstagram(entity.getInstagram());
        dto.setSource(entity.getSource());
        dto.setWebsiteStatus(entity.getWebsiteStatus());
        dto.setLeadScore(entity.getLeadScore());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        dto.setPotentialLevel(scoringService.getPotentialLevel(entity.getLeadScore()));
        dto.setWebsiteStatusLabel(scoringService.getWebsiteStatusLabel(entity.getWebsiteStatus(), entity.getWebsite()));

        // Sugestão e verificação de domínio .com.br
        String suggestedDomain = domainCheckService.suggestDomain(entity.getName());
        dto.setSuggestedDomain(suggestedDomain);

        // Se o estabelecimento não tem site, verifica se o domínio .com.br está disponível
        Boolean domainAvailable = null;
        if (entity.getWebsite() == null || entity.getWebsite().isBlank()) {
            domainAvailable = domainCheckService.checkAvailability(suggestedDomain);
        } else {
            domainAvailable = false;
        }
        dto.setDomainAvailable(domainAvailable);

        // Geração do pitch e link de WhatsApp direto
        String pitch = whatsAppPitchService.generatePitch(
                entity.getName(), entity.getCategory(), entity.getRating(),
                entity.getReviewCount(), entity.getAddress(), suggestedDomain, domainAvailable
        );
        dto.setWhatsappPitch(pitch);

        String waUrl = whatsAppPitchService.buildWhatsAppUrl(entity.getPhone(), pitch);
        dto.setWhatsappUrl(waUrl);

        if (leadOpt != null && leadOpt.isPresent()) {
            Lead lead = leadOpt.get();
            dto.setSavedAsLead(true);
            dto.setLeadId(lead.getId());
            dto.setLeadStatus(lead.getStatus());
        } else {
            dto.setSavedAsLead(false);
            dto.setLeadId(null);
            dto.setLeadStatus(null);
        }

        return dto;
    }
}

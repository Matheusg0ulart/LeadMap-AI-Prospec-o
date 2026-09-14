package com.leadmap.mapper;

import com.leadmap.dto.LeadDto;
import com.leadmap.entity.Lead;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class LeadMapper {

    private final BusinessMapper businessMapper;

    public LeadMapper(BusinessMapper businessMapper) {
        this.businessMapper = businessMapper;
    }

    public LeadDto toDto(Lead entity) {
        if (entity == null) {
            return null;
        }

        LeadDto dto = new LeadDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setStatus(entity.getStatus());
        dto.setStatusLabel(translateStatus(entity.getStatus()));
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getBusiness() != null) {
            dto.setBusiness(businessMapper.toDto(entity.getBusiness(), Optional.of(entity)));
        }

        return dto;
    }

    private String translateStatus(com.leadmap.entity.LeadStatus status) {
        if (status == null) return "";
        switch (status) {
            case NEW:
                return "Novo";
            case CONTACTED:
                return "Contatado";
            case INTERESTED:
                return "Interessado";
            case NEGOTIATING:
                return "Em Negociação";
            case CONVERTED:
                return "Convertido";
            case LOST:
                return "Perdido";
            default:
                return status.name();
        }
    }
}

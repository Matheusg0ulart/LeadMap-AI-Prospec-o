package com.leadmap.service;

import com.leadmap.dto.LeadCreateDto;
import com.leadmap.dto.LeadDto;
import com.leadmap.entity.Business;
import com.leadmap.entity.Lead;
import com.leadmap.entity.LeadStatus;
import com.leadmap.exception.BusinessRuleException;
import com.leadmap.exception.ResourceNotFoundException;
import com.leadmap.mapper.LeadMapper;
import com.leadmap.repository.BusinessRepository;
import com.leadmap.repository.LeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final BusinessRepository businessRepository;
    private final LeadMapper leadMapper;

    public LeadService(LeadRepository leadRepository,
                       BusinessRepository businessRepository,
                       LeadMapper leadMapper) {
        this.leadRepository = leadRepository;
        this.businessRepository = businessRepository;
        this.leadMapper = leadMapper;
    }

    @Transactional
    public LeadDto saveLead(LeadCreateDto dto) {
        Business business = businessRepository.findById(dto.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Estabelecimento não encontrado com ID: " + dto.getBusinessId()));

        Optional<Lead> existing = leadRepository.findByBusinessId(dto.getBusinessId());
        if (existing.isPresent()) {
            Lead lead = existing.get();
            if (dto.getNotes() != null && !dto.getNotes().trim().isEmpty()) {
                lead.setNotes(dto.getNotes());
                lead = leadRepository.save(lead);
            }
            return leadMapper.toDto(lead);
        }

        Lead newLead = new Lead(1L, business, LeadStatus.NEW, dto.getNotes());
        Lead saved = leadRepository.save(newLead);
        return leadMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<LeadDto> listLeads(LeadStatus status) {
        List<Lead> leads;
        if (status != null) {
            leads = leadRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            leads = leadRepository.findAllByOrderByCreatedAtDesc();
        }
        return leads.stream().map(leadMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LeadDto getLeadById(Long id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead não encontrado com ID: " + id));
        return leadMapper.toDto(lead);
    }

    @Transactional
    public LeadDto updateStatus(Long id, LeadStatus newStatus) {
        if (newStatus == null) {
            throw new BusinessRuleException("O novo status do lead não pode ser nulo.");
        }
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead não encontrado com ID: " + id));
        lead.setStatus(newStatus);
        Lead saved = leadRepository.save(lead);
        return leadMapper.toDto(saved);
    }

    @Transactional
    public LeadDto updateNotes(Long id, String notes) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead não encontrado com ID: " + id));
        lead.setNotes(notes);
        Lead saved = leadRepository.save(lead);
        return leadMapper.toDto(saved);
    }

    @Transactional
    public void deleteLead(Long id) {
        if (!leadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lead não encontrado com ID: " + id);
        }
        leadRepository.deleteById(id);
    }
}

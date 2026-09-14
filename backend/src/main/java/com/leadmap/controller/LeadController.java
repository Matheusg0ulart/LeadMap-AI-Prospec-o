package com.leadmap.controller;

import com.leadmap.dto.LeadCreateDto;
import com.leadmap.dto.LeadDto;
import com.leadmap.dto.LeadNotesUpdateDto;
import com.leadmap.dto.LeadStatusUpdateDto;
import com.leadmap.entity.LeadStatus;
import com.leadmap.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    public ResponseEntity<List<LeadDto>> listLeads(@RequestParam(required = false) LeadStatus status) {
        List<LeadDto> leads = leadService.listLeads(status);
        return ResponseEntity.ok(leads);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeadDto> getLeadById(@PathVariable Long id) {
        LeadDto lead = leadService.getLeadById(id);
        return ResponseEntity.ok(lead);
    }

    @PostMapping
    public ResponseEntity<LeadDto> saveLead(@Valid @RequestBody LeadCreateDto dto) {
        LeadDto created = leadService.saveLead(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<LeadDto> updateStatus(@PathVariable Long id, @Valid @RequestBody LeadStatusUpdateDto dto) {
        LeadDto updated = leadService.updateStatus(id, dto.getStatus());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/notes")
    public ResponseEntity<LeadDto> updateNotes(@PathVariable Long id, @RequestBody LeadNotesUpdateDto dto) {
        LeadDto updated = leadService.updateNotes(id, dto.getNotes());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable Long id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }
}

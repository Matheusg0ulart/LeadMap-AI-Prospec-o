package com.leadmap.dto;

import jakarta.validation.constraints.NotNull;

public class LeadCreateDto {

    @NotNull(message = "businessId é obrigatório")
    private Long businessId;

    private String notes;

    public LeadCreateDto() {
    }

    public LeadCreateDto(Long businessId, String notes) {
        this.businessId = businessId;
        this.notes = notes;
    }

    public Long getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Long businessId) {
        this.businessId = businessId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

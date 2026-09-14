package com.leadmap.dto;

import com.leadmap.entity.LeadStatus;
import jakarta.validation.constraints.NotNull;

public class LeadStatusUpdateDto {

    @NotNull(message = "status é obrigatório")
    private LeadStatus status;

    public LeadStatusUpdateDto() {
    }

    public LeadStatusUpdateDto(LeadStatus status) {
        this.status = status;
    }

    public LeadStatus getStatus() {
        return status;
    }

    public void setStatus(LeadStatus status) {
        this.status = status;
    }
}

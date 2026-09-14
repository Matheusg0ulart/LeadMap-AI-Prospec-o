package com.leadmap.dto;

public class LeadNotesUpdateDto {

    private String notes;

    public LeadNotesUpdateDto() {
    }

    public LeadNotesUpdateDto(String notes) {
        this.notes = notes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

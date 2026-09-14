package com.leadmap.dto;

import java.util.Map;

public class DashboardSummaryDto {

    private long totalBusinessesFound;
    private long opportunitiesWithoutWebsite;
    private long savedLeads;
    private long contactedLeads;
    private long conversions;
    private Map<String, Long> leadsByCategory;
    private Map<String, Long> funnel;
    private Map<String, Long> scoreDistribution;

    public DashboardSummaryDto() {
    }

    public long getTotalBusinessesFound() {
        return totalBusinessesFound;
    }

    public void setTotalBusinessesFound(long totalBusinessesFound) {
        this.totalBusinessesFound = totalBusinessesFound;
    }

    public long getOpportunitiesWithoutWebsite() {
        return opportunitiesWithoutWebsite;
    }

    public void setOpportunitiesWithoutWebsite(long opportunitiesWithoutWebsite) {
        this.opportunitiesWithoutWebsite = opportunitiesWithoutWebsite;
    }

    public long getSavedLeads() {
        return savedLeads;
    }

    public void setSavedLeads(long savedLeads) {
        this.savedLeads = savedLeads;
    }

    public long getContactedLeads() {
        return contactedLeads;
    }

    public void setContactedLeads(long contactedLeads) {
        this.contactedLeads = contactedLeads;
    }

    public long getConversions() {
        return conversions;
    }

    public void setConversions(long conversions) {
        this.conversions = conversions;
    }

    public Map<String, Long> getLeadsByCategory() {
        return leadsByCategory;
    }

    public void setLeadsByCategory(Map<String, Long> leadsByCategory) {
        this.leadsByCategory = leadsByCategory;
    }

    public Map<String, Long> getFunnel() {
        return funnel;
    }

    public void setFunnel(Map<String, Long> funnel) {
        this.funnel = funnel;
    }

    public Map<String, Long> getScoreDistribution() {
        return scoreDistribution;
    }

    public void setScoreDistribution(Map<String, Long> scoreDistribution) {
        this.scoreDistribution = scoreDistribution;
    }
}

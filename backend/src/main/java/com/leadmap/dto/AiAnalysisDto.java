package com.leadmap.dto;

import java.util.List;

public class AiAnalysisDto {

    private Long businessId;
    private String businessName;
    private String analysis;
    private String suggestedApproach;
    private List<String> positivePoints;
    private List<String> opportunityPoints;

    public AiAnalysisDto() {
    }

    public AiAnalysisDto(Long businessId, String businessName, String analysis, String suggestedApproach, List<String> positivePoints, List<String> opportunityPoints) {
        this.businessId = businessId;
        this.businessName = businessName;
        this.analysis = analysis;
        this.suggestedApproach = suggestedApproach;
        this.positivePoints = positivePoints;
        this.opportunityPoints = opportunityPoints;
    }

    public Long getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Long businessId) {
        this.businessId = businessId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getAnalysis() {
        return analysis;
    }

    public void setAnalysis(String analysis) {
        this.analysis = analysis;
    }

    public String getSuggestedApproach() {
        return suggestedApproach;
    }

    public void setSuggestedApproach(String suggestedApproach) {
        this.suggestedApproach = suggestedApproach;
    }

    public List<String> getPositivePoints() {
        return positivePoints;
    }

    public void setPositivePoints(List<String> positivePoints) {
        this.positivePoints = positivePoints;
    }

    public List<String> getOpportunityPoints() {
        return opportunityPoints;
    }

    public void setOpportunityPoints(List<String> opportunityPoints) {
        this.opportunityPoints = opportunityPoints;
    }
}

package com.leadmap.dto;

import com.leadmap.entity.LeadStatus;
import com.leadmap.entity.WebsiteStatus;
import java.time.LocalDateTime;

public class BusinessDto {

    private Long id;
    private String externalId;
    private String name;
    private String category;
    private String address;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String website;
    private Double rating;
    private Integer reviewCount;
    private String instagram;
    private String source;
    private WebsiteStatus websiteStatus;
    private String websiteStatusLabel;
    private Integer leadScore;
    private String potentialLevel; // ALTO POTENCIAL, POTENCIAL MÉDIO, BAIXO POTENCIAL
    private boolean savedAsLead;
    private Long leadId;
    private LeadStatus leadStatus;
    private String suggestedDomain;
    private Boolean domainAvailable;
    private String whatsappUrl;
    private String whatsappPitch;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BusinessDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public String getInstagram() {
        return instagram;
    }

    public void setInstagram(String instagram) {
        this.instagram = instagram;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public WebsiteStatus getWebsiteStatus() {
        return websiteStatus;
    }

    public void setWebsiteStatus(WebsiteStatus websiteStatus) {
        this.websiteStatus = websiteStatus;
    }

    public String getWebsiteStatusLabel() {
        return websiteStatusLabel;
    }

    public void setWebsiteStatusLabel(String websiteStatusLabel) {
        this.websiteStatusLabel = websiteStatusLabel;
    }

    public Integer getLeadScore() {
        return leadScore;
    }

    public void setLeadScore(Integer leadScore) {
        this.leadScore = leadScore;
    }

    public String getPotentialLevel() {
        return potentialLevel;
    }

    public void setPotentialLevel(String potentialLevel) {
        this.potentialLevel = potentialLevel;
    }

    public boolean isSavedAsLead() {
        return savedAsLead;
    }

    public void setSavedAsLead(boolean savedAsLead) {
        this.savedAsLead = savedAsLead;
    }

    public Long getLeadId() {
        return leadId;
    }

    public void setLeadId(Long leadId) {
        this.leadId = leadId;
    }

    public LeadStatus getLeadStatus() {
        return leadStatus;
    }

    public void setLeadStatus(LeadStatus leadStatus) {
        this.leadStatus = leadStatus;
    }

    public String getSuggestedDomain() {
        return suggestedDomain;
    }

    public void setSuggestedDomain(String suggestedDomain) {
        this.suggestedDomain = suggestedDomain;
    }

    public Boolean getDomainAvailable() {
        return domainAvailable;
    }

    public void setDomainAvailable(Boolean domainAvailable) {
        this.domainAvailable = domainAvailable;
    }

    public String getWhatsappUrl() {
        return whatsappUrl;
    }

    public void setWhatsappUrl(String whatsappUrl) {
        this.whatsappUrl = whatsappUrl;
    }

    public String getWhatsappPitch() {
        return whatsappPitch;
    }

    public void setWhatsappPitch(String whatsappPitch) {
        this.whatsappPitch = whatsappPitch;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

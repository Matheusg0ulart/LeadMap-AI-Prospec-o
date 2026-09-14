package com.leadmap.dto;

import java.util.List;

public class SearchResponseDto {

    private Long searchId;
    private String location;
    private String category;
    private Integer radius;
    private int totalFound;
    private int withoutWebsiteCount;
    private List<BusinessDto> businesses;

    public SearchResponseDto() {
    }

    public SearchResponseDto(Long searchId, String location, String category, Integer radius, int totalFound, int withoutWebsiteCount, List<BusinessDto> businesses) {
        this.searchId = searchId;
        this.location = location;
        this.category = category;
        this.radius = radius;
        this.totalFound = totalFound;
        this.withoutWebsiteCount = withoutWebsiteCount;
        this.businesses = businesses;
    }

    public Long getSearchId() {
        return searchId;
    }

    public void setSearchId(Long searchId) {
        this.searchId = searchId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getRadius() {
        return radius;
    }

    public void setRadius(Integer radius) {
        this.radius = radius;
    }

    public int getTotalFound() {
        return totalFound;
    }

    public void setTotalFound(int totalFound) {
        this.totalFound = totalFound;
    }

    public int getWithoutWebsiteCount() {
        return withoutWebsiteCount;
    }

    public void setWithoutWebsiteCount(int withoutWebsiteCount) {
        this.withoutWebsiteCount = withoutWebsiteCount;
    }

    public List<BusinessDto> getBusinesses() {
        return businesses;
    }

    public void setBusinesses(List<BusinessDto> businesses) {
        this.businesses = businesses;
    }
}

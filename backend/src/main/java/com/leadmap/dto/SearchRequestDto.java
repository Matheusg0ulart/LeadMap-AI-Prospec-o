package com.leadmap.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SearchRequestDto {

    @NotBlank(message = "Localização é obrigatória")
    private String location;

    @NotBlank(message = "Categoria é obrigatória")
    private String category;

    @NotNull(message = "Raio de pesquisa é obrigatório")
    @Min(value = 500, message = "Raio mínimo é 500 metros")
    @Max(value = 50000, message = "Raio máximo é 50.000 metros")
    private Integer radius; // em metros (ex.: 1000, 2000, 5000, 10000, 20000)

    public SearchRequestDto() {
    }

    public SearchRequestDto(String location, String category, Integer radius) {
        this.location = location;
        this.category = category;
        this.radius = radius;
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
}

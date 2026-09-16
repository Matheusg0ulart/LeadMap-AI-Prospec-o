package com.leadmap.dto;

import jakarta.validation.constraints.NotBlank;

public class BusinessPhoneUpdateDto {

    @NotBlank(message = "Telefone não pode estar em branco")
    private String phone;

    public BusinessPhoneUpdateDto() {}

    public BusinessPhoneUpdateDto(String phone) {
        this.phone = phone;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}

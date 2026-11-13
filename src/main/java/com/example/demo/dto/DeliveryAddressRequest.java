package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DeliveryAddressRequest(
        @NotBlank
        @Size(max = 100)
        String customerName,
        @NotBlank
        @Pattern(regexp = "^[6-9]\\d{9}$")
        String phone,
        @NotBlank
        @Size(max = 1000)
        String deliveryAddress,
        @NotBlank
        @Size(max = 100)
        String city,
        @NotBlank
        @Pattern(regexp = "^\\d{6}$")
        String pincode,
        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        Double deliveryLatitude,
        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        Double deliveryLongitude) {
}

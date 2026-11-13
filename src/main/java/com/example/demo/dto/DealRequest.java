package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DealRequest(
        @NotBlank
        String title,
        @NotBlank
        String dealType,
        @NotNull
        Long productId,
        @NotNull
        @DecimalMin("0.01")
        @DecimalMax("100.00")
        BigDecimal discountPercent,
        @NotNull
        LocalDateTime startsAt,
        @NotNull
        LocalDateTime endsAt,
        Boolean active) {
}

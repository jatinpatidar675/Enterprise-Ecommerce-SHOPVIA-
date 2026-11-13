package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DealResponse(
        Long id,
        String title,
        String dealType,
        Long productId,
        String productName,
        String category,
        String image,
        BigDecimal originalPrice,
        BigDecimal discountedPrice,
        BigDecimal discountPercent,
        int stock,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        boolean active) {



}

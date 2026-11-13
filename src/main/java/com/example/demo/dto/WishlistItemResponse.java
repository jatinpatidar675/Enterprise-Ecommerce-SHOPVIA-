package com.example.demo.dto;

public record WishlistItemResponse(
        Long id,
        Long productId,
        String name,
        String description,
        String category,
        double price,
        int stock,
        String image,
        boolean available) {

}

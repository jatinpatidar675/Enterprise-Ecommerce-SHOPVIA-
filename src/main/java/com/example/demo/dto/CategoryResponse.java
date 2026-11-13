package com.example.demo.dto;

public record CategoryResponse(
        Long id,
        String name,
        String description,
        String image,
        Long parentId,
        long productCount) {



}

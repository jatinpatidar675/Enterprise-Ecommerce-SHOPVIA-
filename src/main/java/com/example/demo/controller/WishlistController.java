package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.WishlistItemResponse;
import com.example.demo.entity.Cart;
import com.example.demo.service.CurrentUserAccessService;
import com.example.demo.service.WishlistService;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;
    private final CurrentUserAccessService accessService;

    public WishlistController(WishlistService wishlistService, CurrentUserAccessService accessService) {
        this.wishlistService = wishlistService;
        this.accessService = accessService;
    }

    @GetMapping("/{userId}")
    public List<WishlistItemResponse> getWishlist(@PathVariable Long userId) {
        accessService.requireOwnerOrAdmin(userId);
        return wishlistService.getWishlist(userId);
    }

    @PostMapping("/{userId}/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public WishlistItemResponse addProduct(@PathVariable Long userId, @PathVariable Long productId) {
        accessService.requireOwnerOrAdmin(userId);
        return wishlistService.addProduct(userId, productId);
    }

    @DeleteMapping("/{userId}/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeProduct(@PathVariable Long userId, @PathVariable Long productId) {
        accessService.requireOwnerOrAdmin(userId);
        wishlistService.removeProduct(userId, productId);
    }

    @PostMapping("/{userId}/{productId}/cart")
    public Cart moveToCart(@PathVariable Long userId, @PathVariable Long productId) {
        accessService.requireOwnerOrAdmin(userId);
        return wishlistService.moveToCart(userId, productId);
    }
}

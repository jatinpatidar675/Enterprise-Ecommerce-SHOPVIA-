package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Cart;
import com.example.demo.service.CartService;
import com.example.demo.service.CurrentUserAccessService;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final CurrentUserAccessService currentUserAccessService;

    public CartController(
            CartService cartService,
            CurrentUserAccessService currentUserAccessService) {
        this.cartService = cartService;
        this.currentUserAccessService = currentUserAccessService;
    }

    @PostMapping("/add")
    public Cart addToCart(@RequestBody Cart cart) {
        currentUserAccessService.requireOwnerOrAdmin(cart.getUserId());
        return cartService.addToCart(cart);
    }

    @GetMapping("/{userId}")
    public List<Cart> getCart(@PathVariable Long userId) {
        currentUserAccessService.requireOwnerOrAdmin(userId);
        return cartService.getCartByUser(userId);
    }

    @DeleteMapping("/{id}")
    public String removeFromCart(@PathVariable Long id) {
        Cart cart = cartService.getCartById(id);
        currentUserAccessService.requireOwnerOrAdmin(cart.getUserId());
        cartService.removeFromCart(id);
        return "Product removed from cart";
    }

    @PutMapping("/{id}")
    public Cart updateQuantity(
            @PathVariable Long id,
            @RequestParam int quantity) {

        Cart cart = cartService.getCartById(id);
        currentUserAccessService.requireOwnerOrAdmin(cart.getUserId());
        return cartService.updateQuantity(id, quantity);
    }
}

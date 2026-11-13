package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.WishlistItemResponse;
import com.example.demo.entity.Cart;
import com.example.demo.entity.Product;
import com.example.demo.entity.WishlistItem;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.WishlistItemRepository;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final CartService cartService;

    public WishlistService(
            WishlistItemRepository wishlistRepository,
            ProductRepository productRepository,
            UserService userService,
            CartService cartService) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userService = userService;
        this.cartService = cartService;
    }

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getWishlist(Long userId) {
        userService.getUserById(userId);
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public WishlistItemResponse addProduct(Long userId, Long productId) {
        userService.getUserById(userId);
        Product product = getProduct(productId);

        WishlistItem item = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseGet(() -> {
                    WishlistItem newItem = new WishlistItem();
                    newItem.setUserId(userId);
                    newItem.setProductId(productId);
                    return wishlistRepository.save(newItem);
                });

        return toResponse(item, product);
    }

    @Transactional
    public void removeProduct(Long userId, Long productId) {
        userService.getUserById(userId);
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public Cart moveToCart(Long userId, Long productId) {
        userService.getUserById(userId);
        wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new IllegalArgumentException("Product is not in this wishlist"));

        Product product = getProduct(productId);
        if (product.getQuantity() < 1) {
            throw new IllegalStateException("This product is currently out of stock");
        }

        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setProductId(productId);
        cart.setQuantity(1);
        Cart savedCart = cartService.addToCart(cart);
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        return savedCart;
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        return toResponse(item, getProduct(item.getProductId()));
    }

    private WishlistItemResponse toResponse(WishlistItem item, Product product) {
        return new WishlistItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory(),
                product.getPrice(),
                product.getQuantity(),
                product.getImage(),
                product.getQuantity() > 0);
    }

    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }
}

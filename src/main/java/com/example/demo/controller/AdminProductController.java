package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Product;
import com.example.demo.service.ProductService;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    // =========================================
    // GET ALL PRODUCTS
    // =========================================

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // =========================================
    // GET PRODUCT BY ID
    // =========================================

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    // =========================================
    // CREATE PRODUCT
    // =========================================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product addProduct(@RequestBody Product product) {
        return productService.addProduct(product);
    }

    // =========================================
    // UPDATE PRODUCT
    // =========================================

    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    // =========================================
    // UPDATE PRODUCT STOCK
    // =========================================

    @PutMapping("/{id}/stock")
    public Product updateProductStock(
            @PathVariable Long id,
            @RequestParam int quantity) {

        Product product = productService.getProductById(id);
        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        product.setQuantity(quantity);
        return productService.updateProduct(id, product);
    }

    // =========================================
    // DELETE PRODUCT
    // =========================================

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return "Product deleted successfully";
    }

    // =========================================
    // GET LOW STOCK PRODUCTS
    // =========================================

    @GetMapping("/low-stock")
    public List<Product> getLowStockProducts(
            @RequestParam(defaultValue = "5") int threshold) {

        List<Product> allProducts = productService.getAllProducts();
        return allProducts.stream()
                .filter(p -> p.getQuantity() <= threshold)
                .toList();
    }
}

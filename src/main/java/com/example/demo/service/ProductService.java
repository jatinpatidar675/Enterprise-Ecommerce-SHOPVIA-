package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product addProduct(Product product) {
        normalizeProductImages(product);
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product updateProduct(Long id, Product product) {

        Product existingProduct = productRepository.findById(id).orElse(null);

        if (existingProduct != null) {

            existingProduct.setName(product.getName());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setQuantity(product.getQuantity());
            existingProduct.setCategory(product.getCategory());
            if ((product.getImages() != null && !product.getImages().isEmpty())
                    || (product.getImage() != null && !product.getImage().isBlank())) {
                normalizeProductImages(product);
                existingProduct.setImages(product.getImages());
                existingProduct.setImage(product.getImage());
            }

            return productRepository.save(existingProduct);
        }

        return null;
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private void normalizeProductImages(Product product) {
        List<String> images = product.getImages() == null
                ? new ArrayList<>()
                : product.getImages().stream()
                        .filter(image -> image != null && !image.isBlank())
                        .map(String::trim)
                        .distinct()
                        .collect(java.util.stream.Collectors.toCollection(ArrayList::new));

        if (images.isEmpty() && product.getImage() != null && !product.getImage().isBlank()) {
            images.add(product.getImage().trim());
        }

        product.setImages(images);
        product.setImage(images.isEmpty() ? null : images.get(0));
    }
}
package com.example.demo.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.CategoryRequest;
import com.example.demo.dto.CategoryResponse;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        List<CategoryResponse> responses = new ArrayList<>();
        Set<String> names = new HashSet<>();

        for (Category category : categoryRepository.findByActiveTrueOrderByNameAsc()) {
            String key = category.getName().toLowerCase(Locale.ROOT);
            names.add(key);
            responses.add(toResponse(category));
        }

        for (String legacyName : productRepository.findDistinctCategories()) {
            String name = legacyName.trim();
            if (!name.isEmpty() && names.add(name.toLowerCase(Locale.ROOT))) {
                responses.add(new CategoryResponse(
                        null, name, "", null, null, productRepository.countByCategoryIgnoreCase(name)));
            }
        }

        responses.sort(Comparator.comparing(CategoryResponse::name, String.CASE_INSENSITIVE_ORDER));
        return responses;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Product> getProducts(String categoryName) {
        if (categoryName == null || categoryName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
        return productRepository.findByCategoryIgnoreCase(categoryName.trim());
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        validateParent(request.parentId(), null);
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndParentId(name, request.parentId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists under this parent");
        }

        Category category = new Category();
        apply(category, request, name);
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = getCategory(id);
        validateParent(request.parentId(), id);
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndParentId(name, request.parentId())
                && !(category.getName().equalsIgnoreCase(name)
                && java.util.Objects.equals(category.getParentId(), request.parentId()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists under this parent");
        }

        apply(category, request, name);
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = getCategory(id);
        if (categoryRepository.countByParentId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Move or delete subcategories first");
        }
        if (productRepository.countByCategoryIgnoreCase(category.getName()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Products still use this category");
        }
        categoryRepository.delete(category);
    }

    private void apply(Category category, CategoryRequest request, String name) {
        category.setName(name);
        category.setDescription(request.description() == null ? "" : request.description().trim());
        category.setImage(request.image() == null ? "" : request.image().trim());
        category.setParentId(request.parentId());
        category.setActive(request.active() == null || request.active());
    }

    private void validateParent(Long parentId, Long categoryId) {
        if (parentId == null) {
            {
     
        }       return;
        }
        if (parentId.equals(categoryId) || !categoryRepository.existsById(parentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid parent category");
        }
        Long ancestorId = parentId;
        while (ancestorId != null) {
            if (ancestorId.equals(categoryId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category hierarchy cannot contain a cycle");
            }
            Category ancestor = categoryRepository.findById(ancestorId).orElse(null);
            ancestorId = ancestor == null ? null : ancestor.getParentId();
        }
    }

    private Category getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(), category.getName(), category.getDescription(), category.getImage(),
 
               category.getParentId(), productRepository.countByCategoryIgnoreCase(category.getName()));
    }
}

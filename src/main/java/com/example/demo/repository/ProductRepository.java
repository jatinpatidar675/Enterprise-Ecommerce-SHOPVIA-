package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryIgnoreCase(String category);

    long countByCategoryIgnoreCase(String category);

    @Query("select distinct p.category from Product p where p.category is not null and trim(p.category) <> ''")
    List<String> findDistinctCategories();

}

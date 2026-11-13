package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByActiveTrueOrderByNameAsc();

    List<Category> findAllByOrderByNameAsc();

    boolean existsByNameIgnoreCaseAndParentId(String name, Long parentId);

    long countByParentId(Long parentId);
}


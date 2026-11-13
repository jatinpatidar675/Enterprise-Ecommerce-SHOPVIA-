package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.DealRequest;
import com.example.demo.dto.DealResponse;
import com.example.demo.service.DealService;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api")
public class DealController {

    private final DealService dealService;

    public DealController(DealService dealService) {
        this.dealService = dealService;
    }

    @GetMapping("/deals")
    public List<DealResponse> getActiveDeals() {
        return dealService.getActiveDeals();
    }

    @GetMapping("/admin/deals")
    public List<DealResponse> getAllDeals() {
        return dealService.getAllDeals();
    }

    @PostMapping("/admin/deals")
    @ResponseStatus(HttpStatus.CREATED)
    public DealResponse create(@Valid @RequestBody DealRequest request) {
        return dealService.create(request);
    }

    @PutMapping("/admin/deals/{id}")
    public DealResponse update(@PathVariable Long id, @Valid @RequestBody DealRequest request) {
        return dealService.update(id, request);
    }

    @PutMapping("/admin/deals/{id}/active")
    public DealResponse setActive(@PathVariable Long id, @RequestParam boolean active) {
        return dealService.setActive(id, active);
    }

    @DeleteMapping("/admin/deals/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        dealService.delete(id);
    }
}

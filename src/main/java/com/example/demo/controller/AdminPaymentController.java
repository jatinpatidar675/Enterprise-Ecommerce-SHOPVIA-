package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Payment;
import com.example.demo.service.PaymentService;

@RestController
@RequestMapping("/api/admin/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminPaymentController {

    private final PaymentService paymentService;

    public AdminPaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // =========================================
    // GET ALL PAYMENTS
    // =========================================

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    // =========================================
    // GET PAYMENT BY ID
    // =========================================

    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }

    // =========================================
    // GET PAYMENTS BY ORDER
    // =========================================

    @GetMapping("/order/{orderId}")
    public List<Payment> getPaymentsByOrder(@PathVariable Long orderId) {
        return paymentService.getPaymentsByOrder(orderId);
    }

    // =========================================
    // GET PAYMENTS BY USER
    // =========================================

    @GetMapping("/user/{userId}")
    public List<Payment> getPaymentsByUser(@PathVariable Long userId) {
        return paymentService.getPaymentsByUser(userId);
    }

    // =========================================
    // UPDATE PAYMENT STATUS
    // =========================================

    @PutMapping("/{id}/status")
    public Payment updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return paymentService.updatePaymentStatus(id, status);
    }

    // =========================================
    // GET PAYMENT SUMMARY
    // =========================================

    @GetMapping("/summary/total")
    public double getTotalPayments() {
        List<Payment> allPayments = paymentService.getAllPayments();
        return allPayments.stream()
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    // =========================================
    // GET SUCCESSFUL PAYMENTS COUNT
    // =========================================

    @GetMapping("/summary/successful")
    public long getSuccessfulPaymentsCount() {
        List<Payment> allPayments = paymentService.getAllPayments();
        return allPayments.stream()
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()))
                .count();
    }
}

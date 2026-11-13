package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.PaymentOrderRequest;
import com.example.demo.dto.PaymentOrderResponse;
import com.example.demo.dto.PaymentVerificationRequest;
import com.example.demo.entity.Order;
import com.example.demo.entity.Payment;
import com.example.demo.service.CurrentUserAccessService;
import com.example.demo.service.OrderService;
import com.example.demo.service.PaymentService;
import com.razorpay.RazorpayException;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final CurrentUserAccessService currentUserAccessService;

    @Value("${razorpay.enabled:false}")
    private boolean razorpayEnabled;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    public PaymentController(
            PaymentService paymentService,
            OrderService orderService,
            CurrentUserAccessService currentUserAccessService) {
        this.paymentService = paymentService;
        this.orderService = orderService;
        this.currentUserAccessService = currentUserAccessService;
    }

    // =========================================
    // CREATE RAZORPAY ORDER
    // =========================================
    @GetMapping("/razorpay/config")
    public Map<String, Object> getRazorpayConfig() {
        boolean available = razorpayEnabled && razorpayKeyId != null && !razorpayKeyId.isBlank();
        return Map.of("enabled", available, "keyId", available ? razorpayKeyId : "");
    }

    @PostMapping("/razorpay/create-order")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentOrderResponse createRazorpayOrder(
            @RequestBody PaymentOrderRequest request) throws RazorpayException {

        currentUserAccessService.requireOwnerOrAdmin(request.getUserId());
        return paymentService.createRazorpayOrder(request);
    }

    // =========================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================
    @PostMapping("/razorpay/verify")
    public Payment verifyRazorpayPayment(
            @RequestBody PaymentVerificationRequest request) throws Exception {

        currentUserAccessService.requireOwnerOrAdmin(request.getUserId());
        return paymentService.verifyRazorpayPayment(request);
    }

    // =========================================
    // MAKE PAYMENT (COD/Legacy)
    // =========================================
    @PostMapping("/pay")
    public Payment makePayment(
            @RequestParam Long userId,
            @RequestParam Long orderId,
            @RequestParam String paymentMethod) {

        currentUserAccessService.requireOwnerOrAdmin(userId);
        return paymentService.makePayment(userId, orderId, paymentMethod);
    }

    // =========================================
    // GET PAYMENTS BY ORDER
    // =========================================
    @GetMapping("/order/{orderId}")
    public List<Payment> getPaymentsByOrder(
            @PathVariable Long orderId) {

        Order order = orderService.getOrderById(orderId);
        currentUserAccessService.requireOwnerOrAdmin(order.getUserId());
        return paymentService.getPaymentsByOrder(orderId);
    }

    // =========================================
    // GET PAYMENTS BY USER
    // =========================================
    @GetMapping("/user/{userId}")
    public List<Payment> getPaymentsByUser(
            @PathVariable Long userId) {

        currentUserAccessService.requireOwnerOrAdmin(userId);
        return paymentService.getPaymentsByUser(userId);
    }

    // =========================================
    // GET PAYMENT BY ID
    // =========================================
    @GetMapping("/{id}")
    public Payment getPaymentById(
            @PathVariable Long id) {

        Payment payment = paymentService.getPaymentById(id);
        currentUserAccessService.requireOwnerOrAdmin(payment.getUserId());
        return payment;
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
    // GET ALL PAYMENTS (Admin)
    // =========================================
    @GetMapping
    public List<Payment> getAllPayments() {

        return paymentService.getAllPayments();
    }
}

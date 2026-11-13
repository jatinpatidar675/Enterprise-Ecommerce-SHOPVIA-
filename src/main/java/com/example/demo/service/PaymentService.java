package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.PaymentOrderRequest;
import com.example.demo.dto.PaymentOrderResponse;
import com.example.demo.dto.PaymentVerificationRequest;
import com.example.demo.entity.Order;
import com.example.demo.entity.Payment;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ObjectProvider<RazorpayClient> razorpayClientProvider;

    @Value("${razorpay.key.secret:}")
    private String razorpaySecret;

    public PaymentService(PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            ObjectProvider<RazorpayClient> razorpayClientProvider) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.razorpayClientProvider = razorpayClientProvider;
    }

    // =========================================
    // CREATE RAZORPAY ORDER
    // =========================================
    public PaymentOrderResponse createRazorpayOrder(PaymentOrderRequest request) throws RazorpayException {

        RazorpayClient razorpayClient = requireRazorpayClient();

        if (request.getAmount() <= 0) {
            throw new RuntimeException("Invalid amount");
        }

        // Convert rupees to paise
        long amountInPaise = (long) (request.getAmount() * 100);

        // Create JSON for Razorpay order
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "order_" + request.getOrderId());
        orderRequest.put("notes", new JSONObject()
                .put("userId", request.getUserId())
                .put("orderId", request.getOrderId())
                .put("description", request.getDescription())
        );

        // Create order with Razorpay
        com.razorpay.Order order = razorpayClient.orders.create(orderRequest);

        // Create payment record
        Payment payment = new Payment();
        payment.setUserId(request.getUserId());
        payment.setOrderId(request.getOrderId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod("RAZORPAY");
        payment.setStatus("PENDING");
        payment.setPaymentDate(LocalDateTime.now());
        payment.setRazorpayOrderId(order.get("id"));

        Payment savedPayment = paymentRepository.save(payment);

        return new PaymentOrderResponse(
                order.get("id"),
                amountInPaise,
                "INR",
                savedPayment.getId()
        );
    }

    // =========================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================
    public Payment verifyRazorpayPayment(PaymentVerificationRequest request) throws Exception {

        requireRazorpayClient();

        if (request.getRazorpayOrderId() == null
                || request.getRazorpayPaymentId() == null
                || request.getRazorpaySignature() == null) {

            throw new RuntimeException("Invalid payment verification data");
        }

        // Verify signature
        boolean isValid = verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!isValid) {
            throw new RuntimeException("Payment verification failed: Invalid signature");
        }

        // Get the payment from database
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Update payment record
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus("SUCCESS");

        return paymentRepository.save(payment);
    }

    // =========================================
    // VERIFY SIGNATURE
    // =========================================
    private boolean verifySignature(String orderId, String paymentId, String signature) throws Exception {

        try {
            com.razorpay.Utils.verifyPaymentSignature(
                    new JSONObject().put("razorpay_order_id", orderId)
                            .put("razorpay_payment_id", paymentId)
                            .put("razorpay_signature", signature),
                    razorpaySecret
            );
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Payment signature verification failed: " + e.getMessage());
        }
    }

    private RazorpayClient requireRazorpayClient() {
        RazorpayClient client = razorpayClientProvider.getIfAvailable();
        if (client == null || razorpaySecret.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Online payments are not configured. Configure Razorpay keys to enable this feature.");
        }
        return client;
    }

    // =========================================
    // MAKE PAYMENT (Legacy COD support)
    // =========================================
    public Payment makePayment(Long userId, Long orderId, String paymentMethod) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(()
                        -> new RuntimeException("Order not found"));

        if ("DELIVERED".equals(order.getStatus())) {
            throw new RuntimeException(
                    "Payment cannot be made after order is delivered");
        }

        List<Payment> existingPayments
                = paymentRepository.findByOrderId(orderId);

        if (!existingPayments.isEmpty()) {
            throw new RuntimeException(
                    "Payment already exists for this order");
        }

        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setOrderId(orderId);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(paymentMethod);
        payment.setStatus("SUCCESS");
        payment.setPaymentDate(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public List<Payment> getPaymentsByOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public List<Payment> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(()
                        -> new RuntimeException("Payment not found"));
    }

    public Payment updatePaymentStatus(Long id, String status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(()
                        -> new RuntimeException("Payment not found"));

        payment.setStatus(status);

        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}

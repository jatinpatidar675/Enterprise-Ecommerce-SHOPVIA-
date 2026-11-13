package com.example.demo.dto;

public class PaymentOrderRequest {

    private Long userId;
    private Long orderId;
    private double amount;
    private String description;

    public PaymentOrderRequest() {
    }

    public PaymentOrderRequest(Long userId, Long orderId, double amount, String description) {
        this.userId = userId;
        this.orderId = orderId;
        this.amount = amount;
        this.description = description;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

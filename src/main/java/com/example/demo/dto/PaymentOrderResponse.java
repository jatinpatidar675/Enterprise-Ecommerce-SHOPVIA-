package com.example.demo.dto;

public class PaymentOrderResponse {

    private String orderId;
    private double amount;
    private String currency;
    private Long id;

    public PaymentOrderResponse() {
    }

    public PaymentOrderResponse(String orderId, double amount, String currency, Long id) {
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}

package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.DeliveryAddressRequest;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderItem;
import com.example.demo.service.CurrentUserAccessService;
import com.example.demo.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CurrentUserAccessService currentUserAccessService;

    public OrderController(
            OrderService orderService,
            CurrentUserAccessService currentUserAccessService) {
        this.orderService = orderService;
        this.currentUserAccessService = currentUserAccessService;
    }

    @PostMapping("/place")
    public Order placeOrder(
            @RequestParam Long userId,
            @Valid @RequestBody(required = false) DeliveryAddressRequest deliveryAddress) {
        currentUserAccessService.requireOwnerOrAdmin(userId);
        return orderService.placeOrder(userId, deliveryAddress);
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrders(@PathVariable Long userId) {
        currentUserAccessService.requireOwnerOrAdmin(userId);
        return orderService.getOrdersByUser(userId);
    }

    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        currentUserAccessService.requireOwnerOrAdmin(order.getUserId());
        return order;
    }

    @GetMapping("/{id}/items")
    public List<OrderItem> getOrderItems(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        currentUserAccessService.requireOwnerOrAdmin(order.getUserId());
        return orderService.getOrderItems(id);
    }

    @PutMapping("/{id}/status")
    public Order updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return orderService.updateOrderStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public String deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return "Order deleted successfully";
    }
}

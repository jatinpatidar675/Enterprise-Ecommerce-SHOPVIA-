package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Order;
import com.example.demo.service.OrderService;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // =========================================
    // GET ALL ORDERS
    // =========================================

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // =========================================
    // GET ORDER BY ID
    // =========================================

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    // =========================================
    // UPDATE ORDER STATUS
    // =========================================

    @PutMapping("/{id}/status")
    public Order updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Order order = orderService.getOrderById(id);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }

        order.setStatus(status);
        return orderService.updateOrder(id, order);
    }

    // =========================================
    // GET ORDERS BY STATUS
    // =========================================

    @GetMapping("/status/{status}")
    public List<Order> getOrdersByStatus(@PathVariable String status) {
        List<Order> allOrders = orderService.getAllOrders();
        return allOrders.stream()
                .filter(o -> status.equalsIgnoreCase(o.getStatus()))
                .toList();
    }
}

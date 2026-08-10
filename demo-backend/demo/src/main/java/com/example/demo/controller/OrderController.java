package com.example.demo.controller;

import com.example.demo.model.Order;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        User user = getAuthenticatedUser();
        order.setUserId(user.getId());
        return orderService.createOrder(order);
    }

    @GetMapping
    public List<Order> getAllOrders(@RequestParam(value = "userId", required = false) Long userId) {
        User user = getAuthenticatedUser();
        if (userId != null && !userId.equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view these orders");
        }
        return orderService.getOrdersByUserId(user.getId());
    }

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        Order order = orderService.getOrderById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!user.getId().equals(order.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view this order");
        }
        return order;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        orderService.deleteOrder(id, user.getId());
    }

    @DeleteMapping("/all")
    public void deleteAllOrders() {
        orderService.deleteAllOrders();
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
    }
}

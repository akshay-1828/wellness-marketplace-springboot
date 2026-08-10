package com.example.demo.controller;

import com.example.demo.dto.CardPaymentRequest;
import com.example.demo.dto.CodPaymentRequest;
import com.example.demo.model.Payment;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.PaymentService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/cod")
    public Payment createCod(@RequestBody CodPaymentRequest req) {
        User user = getAuthenticatedUser();
        return paymentService.createCodPayment(req.getOrderId(), user.getId());
    }

    @GetMapping("/by-order/{orderId}")
    public List<Payment> getPaymentsByOrderId(@PathVariable Long orderId) {
        return paymentService.getPaymentsByOrderId(orderId);
    }


    @PostMapping("/card")
    public Payment chargeCard(@RequestBody CardPaymentRequest req) {
        User user = getAuthenticatedUser();
        req.setUserId(user.getId());
        return paymentService.chargeCard(req);
    }

    @GetMapping("/order/{orderId}")
    public List<Payment> getByOrder(@PathVariable Long orderId) {
        return paymentService.getPaymentsByOrderId(orderId);
    }

    @GetMapping("/user/{userId}")
    public List<Payment> getByUser(@PathVariable Long userId) {
        return paymentService.getPaymentsByUserId(userId);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}

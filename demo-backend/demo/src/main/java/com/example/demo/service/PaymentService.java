package com.example.demo.service;

import com.example.demo.dto.CardPaymentRequest;
import com.example.demo.model.Order;
import com.example.demo.model.Payment;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    public Payment createCodPayment(Long orderId, Long userId) {
        Order order = getAndValidateOrder(orderId, userId);

        Payment payment = new Payment();
        payment.setOrderId(order.getOrderId());
        payment.setUserId(order.getUserId());
        payment.setAmount(order.getTotalAmount());
        payment.setMethod("COD");
        payment.setStatus("PENDING");

        return paymentRepository.save(payment);
    }

    public Payment chargeCard(CardPaymentRequest req) {
        if (req == null) {
            throw badRequest("Request is required");
        }

        Order order = getAndValidateOrder(req.getOrderId(), req.getUserId());
        validateCard(req);

        String digits = onlyDigits(req.getCardNumber());
        String last4 = digits.length() >= 4 ? digits.substring(digits.length() - 4) : null;

        Payment payment = new Payment();
        payment.setOrderId(order.getOrderId());
        payment.setUserId(order.getUserId());
        payment.setAmount(order.getTotalAmount());
        payment.setMethod("CARD");
        payment.setStatus("PAID");
        payment.setTransactionId("TXN-" + UUID.randomUUID());
        payment.setCardLast4(last4);

        Payment saved = paymentRepository.save(payment);

        // Mark order as paid
        order.setStatus("PAID");
        orderRepository.save(order);

        return saved;
    }

    public List<Payment> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    private Order getAndValidateOrder(Long orderId, Long userId) {
        if (orderId == null) {
            throw badRequest("Order ID is required");
        }
        if (userId == null) {
            throw badRequest("User ID is required");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));

        if (!userId.equals(order.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order does not belong to the user");
        }

        return order;
    }

    private void validateCard(CardPaymentRequest req) {
        String digits = onlyDigits(req.getCardNumber());
        if (digits.length() < 12 || digits.length() > 19) {
            throw badRequest("Invalid card number");
        }
        if (!luhnCheck(digits)) {
            throw badRequest("Invalid card number");
        }

        if (req.getExpiryMonth() == null || req.getExpiryYear() == null) {
            throw badRequest("Expiry month/year is required");
        }
        int month = req.getExpiryMonth();
        int year = req.getExpiryYear();
        if (month < 1 || month > 12) {
            throw badRequest("Expiry month must be 1-12");
        }
        // Accept 2-digit year input (e.g., 26) as 2026
        if (year < 100) {
            year = 2000 + year;
        }

        YearMonth expiry = YearMonth.of(year, month);
        if (expiry.isBefore(YearMonth.now())) {
            throw badRequest("Card is expired");
        }

        String cvc = (req.getCvc() == null) ? "" : req.getCvc().trim();
        if (cvc.length() < 3 || cvc.length() > 4) {
            throw badRequest("Invalid CVC");
        }
        if (!cvc.chars().allMatch(Character::isDigit)) {
            throw badRequest("Invalid CVC");
        }

        String name = (req.getNameOnCard() == null) ? "" : req.getNameOnCard().trim();
        if (name.isEmpty()) {
            throw badRequest("Name on card is required");
        }
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private String onlyDigits(String s) {
        if (s == null) return "";
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c >= '0' && c <= '9') out.append(c);
        }
        return out.toString();
    }

    private boolean luhnCheck(String digits) {
        int sum = 0;
        boolean doubleIt = false;
        for (int i = digits.length() - 1; i >= 0; i--) {
            int d = digits.charAt(i) - '0';
            if (doubleIt) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            doubleIt = !doubleIt;
        }
        return sum % 10 == 0;
    }
}

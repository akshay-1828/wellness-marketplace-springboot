package com.example.demo.controller;

import com.example.demo.model.TherapySessionStatus;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.TherapySessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
public class TherapySessionController {

    @Autowired
    private TherapySessionService sessionService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/book")
    public ResponseEntity<?> bookSession(@RequestParam Long slotId, @RequestParam(required = false) String notes) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(sessionService.bookSession(user, slotId, notes));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMySessions() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(sessionService.getSessionsForCurrentUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSessionById(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(sessionService.getSessionByIdForUser(user, id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam TherapySessionStatus status) {
        return ResponseEntity.ok(sessionService.updateStatus(id, status));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingSessions() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(sessionService.getUpcomingSessions(user));
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}

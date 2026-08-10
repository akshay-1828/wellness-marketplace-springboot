package com.example.demo.controller;

import com.example.demo.model.PractitionerAvailableSlot;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.PractitionerSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/practitioner")
public class PractitionerSlotController {

    @Autowired
    private PractitionerSlotService slotService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<PractitionerAvailableSlot>> getSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(slotService.getSlots(id, date));
    }

    @PostMapping("/slots")
    public ResponseEntity<?> addSlot(@RequestBody PractitionerAvailableSlot slot) {
        User user = getAuthenticatedUser();
        slot.setPractitioner(user);
        return ResponseEntity.ok(slotService.createSlot(slot));
    }

    @GetMapping("/slots/my")
    public ResponseEntity<?> getMySlots() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(slotService.getSlotsForPractitioner(user));
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        slotService.deleteSlot(id, user);
        return ResponseEntity.ok(java.util.Map.of("message", "Slot deleted successfully"));
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}

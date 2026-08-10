package com.example.demo.controller;

import com.example.demo.dto.PractitionerProfileResponse;
import com.example.demo.dto.PractitionerProfileRequest;
import com.example.demo.model.PractitionerProfile;
import com.example.demo.model.User;
import com.example.demo.model.VerificationStatus;
import com.example.demo.repository.PractitionerProfileRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/practitioner")
public class PractitionerController {

    @Autowired
    PractitionerProfileRepository practitionerProfileRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ReviewRepository reviewRepository;

    private PractitionerProfileResponse toDto(PractitionerProfile p) {
        User u = p.getUser();

        double avgRating = 0.0;
        if (u != null && u.getId() != null) {
            Double computed = reviewRepository.findAverageRatingByPractitionerId(u.getId());
            if (computed != null) {
                avgRating = Math.round(computed * 10.0) / 10.0;
            }
        }

        return new PractitionerProfileResponse(
                p.getId(),
                u != null ? u.getId() : null,
                u != null ? u.getName() : null,
                u != null ? u.getEmail() : null,
                p.getLicenseNumber(),
                p.getSpecialization(),
                p.getExperienceYears(),
                p.getVerificationStatus(),
                avgRating,
                p.getBalance()
        );
    }

    @GetMapping("/me/earnings")
    public ResponseEntity<?> getEarnings() {
        User user = getAuthenticatedUser();
        PractitionerProfile p = practitionerProfileRepository.findByUser(user).orElseThrow();
        if (isAyurvedaText(p.getSpecialization())) {
            return ResponseEntity.status(403).body("Ayurveda practitioners are not supported.");
        }
        return ResponseEntity.ok(toDto(p));
    }

    @PostMapping("/profile")
    public ResponseEntity<?> createOrUpdateProfile(@RequestBody PractitionerProfileRequest req) {
        User user = getAuthenticatedUser();
        if (req.getUserId() != null && !req.getUserId().equals(user.getId())) {
            return ResponseEntity.status(403).body("userId does not match the authenticated user");
        }

        if (isAyurvedaText(req.getSpecialization())) {
            return ResponseEntity.badRequest().body("Ayurveda specialization is not supported.");
        }

        PractitionerProfile profile = practitionerProfileRepository.findByUser(user).orElse(new PractitionerProfile());
        profile.setUser(user);
        profile.setLicenseNumber(req.getLicenseNumber());
        profile.setSpecialization(req.getSpecialization());
        profile.setExperienceYears(req.getExperienceYears());
        if (profile.getVerificationStatus() == null) profile.setVerificationStatus(VerificationStatus.PENDING);
        practitionerProfileRepository.save(profile);
        return ResponseEntity.status(201).body(toDto(profile));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile() {
        User user = getAuthenticatedUser();
        return practitionerProfileRepository.findByUser(user)
                .map(p -> {
                    if (isAyurvedaText(p.getSpecialization())) {
                        return ResponseEntity.status(404).body("Practitioner not found");
                    }
                    return ResponseEntity.ok(toDto(p));
                })
                .orElseGet(() -> ResponseEntity.status(404).body("Profile not found"));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUserId(@PathVariable Long userId) {
        if (userId == null) {
            return ResponseEntity.badRequest().body("userId is required");
        }

        PractitionerProfile p = practitionerProfileRepository.findByUserId(userId).orElseThrow();
        if (isAyurvedaText(p.getSpecialization())) {
            return ResponseEntity.status(404).body("Practitioner not found");
        }
        return ResponseEntity.ok(toDto(p));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        PractitionerProfile p = practitionerProfileRepository.findById(id).orElseThrow();
        if (isAyurvedaText(p.getSpecialization())) {
            return ResponseEntity.status(404).body("Practitioner not found");
        }
        return ResponseEntity.ok(toDto(p));
    }

    @GetMapping("/verified")
    public ResponseEntity<?> getVerified() {
        List<PractitionerProfile> list = practitionerProfileRepository.findByVerificationStatus(VerificationStatus.VERIFIED);
        return ResponseEntity.ok(list.stream()
                .filter(p -> !isAyurvedaText(p != null ? p.getSpecialization() : null))
                .map(this::toDto)
                .collect(Collectors.toList()));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<?> setVerificationStatus(@PathVariable Long id, @RequestParam("status") VerificationStatus status) {
        PractitionerProfile p = practitionerProfileRepository.findById(id).orElseThrow();
        p.setVerificationStatus(status);
        practitionerProfileRepository.save(p);
        return ResponseEntity.ok(toDto(p));
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    private static boolean isAyurvedaText(String text) {
        if (text == null) return false;
        return text.toLowerCase().contains("ayur");
    }
}

package com.example.demo.dto;

import com.example.demo.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PractitionerProfileResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String licenseNumber;
    private String specialization;
    private Integer experienceYears;
    private VerificationStatus verificationStatus;
    private double rating;
    private java.math.BigDecimal balance;
}

package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PractitionerProfileRequest {
    private Long userId;
    private String licenseNumber;
    private String specialization;
    private Integer experienceYears;
}

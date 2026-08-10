package com.example.demo.controller;

import lombok.Data;

@Data
public class PractitionerProfileRequest {
    private Long userId;
    private String licenseNumber;
    private String specialization;
    private Integer experienceYears;
}

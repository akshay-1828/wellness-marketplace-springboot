package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PractitionerLicenseLookupResponse {
    private String practitionerName;
    private String email;
    private String specialization;
    private String issuingAuthority;
    private String verificationStatus;
}
package com.example.demo.dto;

public class NpiPractitionerDetails {
    private final String npiNumber;
    private final String practitionerName;
    private final String primaryTaxonomy;
    private final String enumerationType;
    private final String email;

    public NpiPractitionerDetails(
            String npiNumber,
            String practitionerName,
            String primaryTaxonomy,
            String enumerationType,
            String email
    ) {
        this.npiNumber = npiNumber;
        this.practitionerName = practitionerName;
        this.primaryTaxonomy = primaryTaxonomy;
        this.enumerationType = enumerationType;
        this.email = email;
    }

    public String getNpiNumber() {
        return npiNumber;
    }

    public String getPractitionerName() {
        return practitionerName;
    }

    public String getPrimaryTaxonomy() {
        return primaryTaxonomy;
    }

    public String getEnumerationType() {
        return enumerationType;
    }

    public String getEmail() {
        return email;
    }
}
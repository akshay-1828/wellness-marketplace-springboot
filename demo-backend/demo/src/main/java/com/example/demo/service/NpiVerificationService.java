package com.example.demo.service;

import com.example.demo.dto.NpiPractitionerDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class NpiVerificationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String npiBaseUrl;

    public NpiVerificationService(@Value("${npi.api.base-url}") String npiBaseUrl) {
        this.npiBaseUrl = npiBaseUrl;
    }

    public NpiPractitionerDetails lookupByNpi(String npiNumber) {
        if (npiNumber == null || npiNumber.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "NPI number is required");
        }

        String url = UriComponentsBuilder.fromHttpUrl(npiBaseUrl)
                .queryParam("version", "2.1")
                .queryParam("number", npiNumber)
                .toUriString();

        Map<String, Object> body = restTemplate.getForObject(url, Map.class);
        if (body == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No practitioner data found in NPI Registry");
        }

        Object countObj = body.get("result_count");
        int count = (countObj instanceof Number) ? ((Number) countObj).intValue() : 0;
        if (count < 1) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "NPI number not found in registry");
        }

        List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
        if (results == null || results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "NPI number not found in registry");
        }

        Map<String, Object> first = results.get(0);
        String enumerationType = stringValue(first.get("enumeration_type"));
        String npi = stringValue(first.get("number"));

        String practitionerName = extractName(first);
        String taxonomy = extractPrimaryTaxonomy(first);
        String email = extractEmail(first);

        return new NpiPractitionerDetails(npi, practitionerName, taxonomy, enumerationType, email);
    }

    private String extractName(Map<String, Object> first) {
        Object basicObj = first.get("basic");
        if (basicObj instanceof Map<?, ?> basic) {
            String firstName = stringValue(basic.get("first_name"));
            String lastName = stringValue(basic.get("last_name"));
            String credential = stringValue(basic.get("credential"));
            String fullName = String.join(" ",
                    new String[]{firstName, lastName}).trim();
            if (!credential.isBlank()) {
                fullName = (fullName + ", " + credential).trim();
            }
            return fullName.isBlank() ? null : fullName;
        }
        return null;
    }

    private String extractPrimaryTaxonomy(Map<String, Object> first) {
        Object taxonomiesObj = first.get("taxonomies");
        if (taxonomiesObj instanceof List<?> taxonomies) {
            for (Object t : taxonomies) {
                if (t instanceof Map<?, ?> taxMap) {
                    Object primary = taxMap.get("primary");
                    boolean isPrimary = primary instanceof Boolean && (Boolean) primary;
                    if (isPrimary) {
                        String desc = stringValue(taxMap.get("desc"));
                        if (!desc.isBlank()) {
                            return desc;
                        }
                    }
                }
            }
        }
        return null;
    }

    private String extractEmail(Map<String, Object> first) {
        // NPI Registry does not provide email addresses in public data
        // Email must be collected separately during registration
        return null;
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
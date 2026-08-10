package com.example.demo.service;

import com.example.demo.model.PractitionerProfile;
import com.example.demo.model.Product;
import com.example.demo.model.VerificationStatus;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.PractitionerProfileRepository;
import com.example.demo.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductCatalogService {

    private final ProductRepository productRepository;
    private final PractitionerProfileRepository practitionerProfileRepository;
    private final OrderRepository orderRepository;

    public ProductCatalogService(ProductRepository productRepository,
                                 PractitionerProfileRepository practitionerProfileRepository,
                                 OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.practitionerProfileRepository = practitionerProfileRepository;
        this.orderRepository = orderRepository;
    }

    public String reseedCatalogFromPractitionerSpecializations(boolean blockIfOrdersExist) {
        List<PractitionerProfile> practitioners = practitionerProfileRepository.findByVerificationStatus(VerificationStatus.VERIFIED);
        if (practitioners.isEmpty()) {
            practitioners = practitionerProfileRepository.findAll();
        }

        // Ayurveda practitioners are not supported.
        practitioners = practitioners.stream()
                .filter(p -> !isAyurvedaText(p != null ? p.getSpecialization() : null))
                .toList();

        if (practitioners.isEmpty()) {
            return "No eligible practitioners found (Ayurveda excluded); catalog reseed skipped.";
        }

        if (blockIfOrdersExist && orderRepository.count() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot reseed products while orders exist. Delete orders first, then retry.");
        }

        // destructive reseed
        productRepository.deleteAll();

        int generatedCount = 0;

        Map<String, List<String[]>> templates = new HashMap<>();

        templates.put("infectious", java.util.Arrays.asList(
                new String[]{"Hand Hygiene Essentials Kit", "Soap + sanitizer + wipes bundle for day-to-day protection", "399.00", "120"},
                new String[]{"Immune Support Vitamin C + Zinc", "Daily support supplement for immune health", "499.00", "150"},
                new String[]{"Travel Health Kit", "Basic travel kit with masks, sanitizer, and thermometer", "650.00", "80"},
                new String[]{"Oral Rehydration Salts (ORS)", "Electrolyte sachets supporting hydration during illness", "180.00", "200"}
        ));

        templates.put("internal medicine", java.util.Arrays.asList(
                new String[]{"Digital Blood Pressure Monitor", "Upper-arm BP monitor with cuff and storage", "1299.00", "70"},
                new String[]{"Glucometer Starter Kit", "Blood glucose meter with lancets and test strips", "1199.00", "65"},
                new String[]{"Heart Health Omega-3", "Omega-3 supplement supporting cardiovascular wellness", "699.00", "120"},
                new String[]{"Daily Wellness Multivitamin", "Balanced multivitamin for routine nutrition support", "549.00", "160"}
        ));

        templates.put("family medicine", java.util.Arrays.asList(
                new String[]{"Family First Aid Kit", "Home first-aid kit with bandages, antiseptic, and basics", "799.00", "90"},
                new String[]{"Non-Contact Thermometer", "Fast, easy temperature checks for all ages", "999.00", "85"},
                new String[]{"Kids Multivitamin Gummies", "Daily gummy vitamins for children (assorted flavors)", "499.00", "140"},
                new String[]{"Home Wellness Starter Pack", "Thermometer + ORS + basic care essentials", "899.00", "60"}
        ));

        templates.put("orthopaedic", java.util.Arrays.asList(
                new String[]{"Knee Compression Sleeve", "Support sleeve for comfort during activity and rehab", "699.00", "110"},
                new String[]{"Ankle Support Brace", "Adjustable brace supporting stability", "599.00", "120"},
                new String[]{"Cold Therapy Gel Pack", "Reusable ice/heat pack for soreness and recovery", "349.00", "200"},
                new String[]{"Posture Support Belt", "Support belt encouraging proper posture", "799.00", "90"}
        ));

        templates.put("orthopedic", templates.get("orthopaedic"));

        templates.put("hand surgery", java.util.Arrays.asList(
                new String[]{"Wrist Stabilizer Splint", "Wrist splint supporting comfort for daily tasks", "649.00", "140"},
                new String[]{"Finger Extension Splints (Set)", "Splints supporting finger positioning and support", "399.00", "150"},
                new String[]{"Hand Therapy Putty", "Progressive resistance putty for grip and dexterity", "299.00", "200"},
                new String[]{"Grip Strength Trainer", "Adjustable grip trainer for hand rehabilitation", "349.00", "180"}
        ));

        templates.put("social worker", java.util.Arrays.asList(
                new String[]{"Guided Mindfulness Journal", "Daily prompts for reflection, coping, and grounding", "299.00", "180"},
                new String[]{"Stress Management Workbook", "Practical exercises for managing stress and routines", "399.00", "140"},
                new String[]{"Sleep Hygiene Toolkit", "Checklist + planner to support healthy sleep habits", "349.00", "160"},
                new String[]{"Breathing & Grounding Cards", "Pocket cards with quick grounding techniques", "249.00", "220"}
        ));

        templates.put("clinical", templates.get("social worker"));

        List<String[]> fallbackTemplates = java.util.Arrays.asList(
                new String[]{"General Wellness Supplement", "Daily supplement supporting overall wellness", "500.00", "120"},
                new String[]{"Hydration & Recovery Mix", "Electrolyte mix supporting hydration and recovery", "320.00", "160"},
                new String[]{"Wellness Planner", "Weekly planner for habits, sleep, movement, and goals", "249.00", "200"}
        );

        Set<String> usedNames = new HashSet<>();

        // Defensive: ensure uniqueness against any existing data (or concurrent inserts).
        usedNames.addAll(productRepository.findAll().stream()
            .map(Product::getName)
            .filter(n -> n != null && !n.isBlank())
            .collect(Collectors.toSet()));

        for (PractitionerProfile p : practitioners) {
            String specialization = p.getSpecialization() == null ? "" : p.getSpecialization().trim();
            String spec = specialization.toLowerCase();

            List<String[]> itemsToCreate = fallbackTemplates;
            String matchedKey = null;
            for (String key : templates.keySet()) {
                if (!spec.isEmpty() && spec.contains(key)) {
                    itemsToCreate = templates.get(key);
                    matchedKey = key;
                    break;
                }
            }

            String category = specialization.isBlank() ? "General Wellness" : specialization;

            for (String[] item : itemsToCreate) {
                String baseName = item[0];
                String name = baseName;
                if (practitioners.size() > 1) {
                    name = baseName + " (Seller " + p.getId() + ")";
                }
                while (usedNames.contains(name)) {
                    name = name + "*";
                }
                usedNames.add(name);

                Product np = new Product();
                np.setName(name);
                np.setDescription(item[1]);
                np.setPrice(new java.math.BigDecimal(item[2]));
                np.setCategory(category);
                np.setStock(Integer.parseInt(item[3]));
                // IMPORTANT: this uses PractitionerProfile.id so OrderService can credit balance.
                np.setPractitionerId(p.getId());
                np.setImageUrl(imageForProductName(baseName, matchedKey));

                productRepository.save(np);
                generatedCount++;
            }
        }

        return "Catalog reseeded from practitioner specializations (Ayurveda excluded). Practitioners used: " + practitioners.size() + ", Products generated: " + generatedCount;
    }

    /**
     * Non-destructive catalog generation: adds practitioner-owned products without deleting existing ones.
     * Intended for cases where orders already exist and we must not break historical references.
     */
    public String addCatalogFromPractitionerSpecializationsIfMissing() {
        if (productRepository.countByPractitionerIdIsNotNull() > 0) {
            return "Catalog already contains practitioner-owned products; no changes.";
        }

        List<PractitionerProfile> practitioners = practitionerProfileRepository.findByVerificationStatus(VerificationStatus.VERIFIED);
        if (practitioners.isEmpty()) {
            practitioners = practitionerProfileRepository.findAll();
        }

        // Ayurveda practitioners are not supported.
        practitioners = practitioners.stream()
                .filter(p -> !isAyurvedaText(p != null ? p.getSpecialization() : null))
                .toList();

        if (practitioners.isEmpty()) {
            return "No eligible practitioners found (Ayurveda excluded); catalog add skipped.";
        }

        int generatedCount = 0;

        Map<String, List<String[]>> templates = new HashMap<>();

        templates.put("infectious", java.util.Arrays.asList(
                new String[]{"Hand Hygiene Essentials Kit", "Soap + sanitizer + wipes bundle for day-to-day protection", "399.00", "120"},
                new String[]{"Immune Support Vitamin C + Zinc", "Daily support supplement for immune health", "499.00", "150"},
                new String[]{"Travel Health Kit", "Basic travel kit with masks, sanitizer, and thermometer", "650.00", "80"},
                new String[]{"Oral Rehydration Salts (ORS)", "Electrolyte sachets supporting hydration during illness", "180.00", "200"}
        ));

        templates.put("internal medicine", java.util.Arrays.asList(
                new String[]{"Digital Blood Pressure Monitor", "Upper-arm BP monitor with cuff and storage", "1299.00", "70"},
                new String[]{"Glucometer Starter Kit", "Blood glucose meter with lancets and test strips", "1199.00", "65"},
                new String[]{"Heart Health Omega-3", "Omega-3 supplement supporting cardiovascular wellness", "699.00", "120"},
                new String[]{"Daily Wellness Multivitamin", "Balanced multivitamin for routine nutrition support", "549.00", "160"}
        ));

        templates.put("family medicine", java.util.Arrays.asList(
                new String[]{"Family First Aid Kit", "Home first-aid kit with bandages, antiseptic, and basics", "799.00", "90"},
                new String[]{"Non-Contact Thermometer", "Fast, easy temperature checks for all ages", "999.00", "85"},
                new String[]{"Kids Multivitamin Gummies", "Daily gummy vitamins for children (assorted flavors)", "499.00", "140"},
                new String[]{"Home Wellness Starter Pack", "Thermometer + ORS + basic care essentials", "899.00", "60"}
        ));

        templates.put("orthopaedic", java.util.Arrays.asList(
                new String[]{"Knee Compression Sleeve", "Support sleeve for comfort during activity and rehab", "699.00", "110"},
                new String[]{"Ankle Support Brace", "Adjustable brace supporting stability", "599.00", "120"},
                new String[]{"Cold Therapy Gel Pack", "Reusable ice/heat pack for soreness and recovery", "349.00", "200"},
                new String[]{"Posture Support Belt", "Support belt encouraging proper posture", "799.00", "90"}
        ));

        templates.put("orthopedic", templates.get("orthopaedic"));

        templates.put("hand surgery", java.util.Arrays.asList(
                new String[]{"Wrist Stabilizer Splint", "Wrist splint supporting comfort for daily tasks", "649.00", "140"},
                new String[]{"Finger Extension Splints (Set)", "Splints supporting finger positioning and support", "399.00", "150"},
                new String[]{"Hand Therapy Putty", "Progressive resistance putty for grip and dexterity", "299.00", "200"},
                new String[]{"Grip Strength Trainer", "Adjustable grip trainer for hand rehabilitation", "349.00", "180"}
        ));

        templates.put("social worker", java.util.Arrays.asList(
                new String[]{"Guided Mindfulness Journal", "Daily prompts for reflection, coping, and grounding", "299.00", "180"},
                new String[]{"Stress Management Workbook", "Practical exercises for managing stress and routines", "399.00", "140"},
                new String[]{"Sleep Hygiene Toolkit", "Checklist + planner to support healthy sleep habits", "349.00", "160"},
                new String[]{"Breathing & Grounding Cards", "Pocket cards with quick grounding techniques", "249.00", "220"}
        ));

        templates.put("clinical", templates.get("social worker"));

        List<String[]> fallbackTemplates = java.util.Arrays.asList(
                new String[]{"General Wellness Supplement", "Daily supplement supporting overall wellness", "500.00", "120"},
                new String[]{"Hydration & Recovery Mix", "Electrolyte mix supporting hydration and recovery", "320.00", "160"},
                new String[]{"Wellness Planner", "Weekly planner for habits, sleep, movement, and goals", "249.00", "200"}
        );

        Set<String> usedNames = new HashSet<>();
        usedNames.addAll(productRepository.findAll().stream()
                .map(Product::getName)
                .filter(n -> n != null && !n.isBlank())
                .collect(Collectors.toSet()));

        for (PractitionerProfile p : practitioners) {
            String specialization = p.getSpecialization() == null ? "" : p.getSpecialization().trim();
            String spec = specialization.toLowerCase();

            List<String[]> itemsToCreate = fallbackTemplates;
            String matchedKey = null;
            for (String key : templates.keySet()) {
                if (!spec.isEmpty() && spec.contains(key)) {
                    itemsToCreate = templates.get(key);
                    matchedKey = key;
                    break;
                }
            }

            String category = specialization.isBlank() ? "General Wellness" : specialization;

            for (String[] item : itemsToCreate) {
                String baseName = item[0];
                String name = baseName;
                if (practitioners.size() > 1) {
                    name = baseName + " (Seller " + p.getId() + ")";
                }
                while (usedNames.contains(name)) {
                    name = name + "*";
                }
                usedNames.add(name);

                Product np = new Product();
                np.setName(name);
                np.setDescription(item[1]);
                np.setPrice(new java.math.BigDecimal(item[2]));
                np.setCategory(category);
                np.setStock(Integer.parseInt(item[3]));
                np.setPractitionerId(p.getId());
                np.setImageUrl(imageForProductName(baseName, matchedKey));

                productRepository.save(np);
                generatedCount++;
            }
        }

        return "Catalog added from practitioner specializations (Ayurveda excluded). Practitioners used: " + practitioners.size() + ", Products generated: " + generatedCount;
    }

    private static boolean isAyurvedaText(String text) {
        if (text == null) return false;
        return text.toLowerCase().contains("ayur");
    }

    private String imageForProductName(String productBaseName, String matchedKey) {
        String name = productBaseName == null ? "" : productBaseName.toLowerCase();

        // Name-based images (most specific)
        if (name.contains("supplement") || name.contains("omega") || name.contains("vitamin")) {
            return "/product-images/supplement.svg";
        }
        if (name.contains("hydration") || name.contains("electrolyte") || name.contains("ors")) {
            return "/product-images/hydration.svg";
        }
        if (name.contains("planner") || name.contains("journal")) {
            return "/product-images/planner.svg";
        }
        if (name.contains("kit") || name.contains("starter")) {
            return "/product-images/kit.svg";
        }
        if (name.contains("thermometer")) {
            return "/product-images/thermometer.svg";
        }
        if (name.contains("monitor") || name.contains("blood pressure") || name.contains("bp")) {
            return "/product-images/monitor.svg";
        }
        if (name.contains("glucometer") || name.contains("glucose")) {
            return "/product-images/glucometer.svg";
        }
        if (name.contains("sleeve") || name.contains("compression")) {
            return "/product-images/sleeve.svg";
        }
        if (name.contains("brace") || name.contains("belt") || name.contains("support")) {
            return "/product-images/brace.svg";
        }
        if (name.contains("splint") || name.contains("stabilizer")) {
            return "/product-images/splint.svg";
        }
        if (name.contains("workbook")) {
            return "/product-images/workbook.svg";
        }
        if (name.contains("cards")) {
            return "/product-images/cards.svg";
        }

        // Fallback to specialization-category images
        if (matchedKey == null || matchedKey.isBlank()) {
            return "/product-images/general.svg";
        }
        return switch (matchedKey) {
            case "infectious" -> "/product-images/infectious.svg";
            case "internal medicine" -> "/product-images/internal_medicine.svg";
            case "family medicine" -> "/product-images/family_medicine.svg";
            case "orthopaedic", "orthopedic" -> "/product-images/orthopedic.svg";
            case "hand surgery" -> "/product-images/hand_surgery.svg";
            case "social worker", "clinical" -> "/product-images/mental_health.svg";
            default -> "/product-images/general.svg";
        };
    }
}

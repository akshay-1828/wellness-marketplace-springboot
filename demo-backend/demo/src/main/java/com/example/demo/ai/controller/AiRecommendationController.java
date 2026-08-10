package com.example.demo.ai.controller;

import com.example.demo.ai.dto.AiRecommendationRequest;
import com.example.demo.ai.dto.AiRecommendationResponse;
import com.example.demo.ai.service.AiRecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;

    public AiRecommendationController(AiRecommendationService aiRecommendationService) {
        this.aiRecommendationService = aiRecommendationService;
    }

    @PostMapping("/recommend")
    public ResponseEntity<AiRecommendationResponse> recommend(@RequestBody AiRecommendationRequest request) {
        return ResponseEntity.ok(aiRecommendationService.recommend(request));
    }
}

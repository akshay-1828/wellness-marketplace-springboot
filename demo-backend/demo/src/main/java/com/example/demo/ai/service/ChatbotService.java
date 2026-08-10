package com.example.demo.ai.service;

import com.example.demo.ai.dto.AiRecommendationRequest;
import com.example.demo.ai.dto.ChatAnswerResponse;
import com.example.demo.ai.dto.ChatStartResponse;
import com.example.demo.ai.model.ChatSessionState;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatbotService {

    private final AiRecommendationService aiRecommendationService;
    private final Map<String, ChatSessionState> sessions = new ConcurrentHashMap<>();

    public ChatbotService(AiRecommendationService aiRecommendationService) {
        this.aiRecommendationService = aiRecommendationService;
    }

    public ChatStartResponse start() {
        String sessionId = UUID.randomUUID().toString();
        ChatSessionState state = new ChatSessionState();
        state.setStep(1);
        sessions.put(sessionId, state);

        return new ChatStartResponse(sessionId, "What symptoms do you have?", 1);
    }

    public ChatAnswerResponse answer(String sessionId, String answer) {
        ChatSessionState state = sessions.get(sessionId);
        if (state == null) {
            ChatAnswerResponse invalid = new ChatAnswerResponse();
            invalid.setSessionId(sessionId);
            invalid.setCompleted(true);
            invalid.setRecommendation("Invalid or expired session. Please start again.");
            return invalid;
        }

        int step = state.getStep();
        String normalized = answer == null ? "" : answer.trim();

        if (step == 1) {
            state.setSymptoms(normalized);
            state.setStep(2);
            return next(sessionId, 2, "What is the severity level? (low/medium/high)");
        }

        if (step == 2) {
            state.setSeverityLevel(normalized);
            state.setStep(3);
            return next(sessionId, 3, "How long have you had this issue?");
        }

        if (step == 3) {
            state.setDuration(normalized);
            state.setStep(4);
            return next(sessionId, 4, "Any additional symptoms?");
        }

        state.setAdditionalSymptoms(normalized);

        AiRecommendationRequest req = new AiRecommendationRequest();
        req.setSymptoms(state.getSymptoms());
        req.setSeverityLevel(state.getSeverityLevel());
        req.setDuration(state.getDuration());
        req.setAdditionalSymptoms(state.getAdditionalSymptoms());

        String recommendation = aiRecommendationService.recommend(req).getRecommendation();
        sessions.remove(sessionId);

        ChatAnswerResponse done = new ChatAnswerResponse();
        done.setSessionId(sessionId);
        done.setStep(5);
        done.setCompleted(true);
        done.setRecommendation(recommendation);
        return done;
    }

    private ChatAnswerResponse next(String sessionId, int step, String question) {
        ChatAnswerResponse response = new ChatAnswerResponse();
        response.setSessionId(sessionId);
        response.setStep(step);
        response.setCompleted(false);
        response.setQuestion(question);
        return response;
    }
}

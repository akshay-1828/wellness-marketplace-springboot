package com.example.demo.service;

import com.example.demo.model.Question;
import com.example.demo.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public Question saveQuestion(Question question) {
        if (question.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (question.getQuestion() == null || question.getQuestion().isBlank()) {
            throw new IllegalArgumentException("Question is required");
        }
        return questionRepository.save(question);
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }
}

package com.example.demo.service;

import com.example.demo.model.Answer;
import com.example.demo.repository.AnswerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnswerService {

    private final AnswerRepository answerRepository;

    public AnswerService(AnswerRepository answerRepository) {
        this.answerRepository = answerRepository;
    }

    public Answer saveAnswer(Answer answer) {
        if (answer.getQuestionId() == null) {
            throw new IllegalArgumentException("Question ID is required");
        }
        if (answer.getPractitionerId() == null) {
            throw new IllegalArgumentException("Practitioner ID is required");
        }
        if (answer.getAnswer() == null || answer.getAnswer().isBlank()) {
            throw new IllegalArgumentException("Answer is required");
        }
        return answerRepository.save(answer);
    }

    public List<Answer> getAnswersByQuestion(Long questionId) {
        return answerRepository.findByQuestionId(questionId);
    }
}

package com.example.demo.controller;

import com.example.demo.model.Answer;
import com.example.demo.model.Question;
import com.example.demo.service.AnswerService;
import com.example.demo.service.QuestionService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CommunityController {

    private final QuestionService questionService;
    private final AnswerService answerService;

    public CommunityController(QuestionService questionService, AnswerService answerService) {
        this.questionService = questionService;
        this.answerService = answerService;
    }

    @PostMapping("/questions")
    public Question postQuestion(@RequestBody Question question) {
        return questionService.saveQuestion(question);
    }

    @GetMapping("/questions")
    public List<Question> getQuestions() {
        return questionService.getAllQuestions();
    }

    @PostMapping("/answers")
    public Answer postAnswer(@RequestBody Answer answer) {
        return answerService.saveAnswer(answer);
    }

    @GetMapping("/questions/{id}/answers")
    public List<Answer> getAnswers(@PathVariable Long id) {
        return answerService.getAnswersByQuestion(id);
    }
}

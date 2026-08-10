package com.example.demo.service;

import com.example.demo.model.Review;
import com.example.demo.repository.PractitionerProfileRepository;
import com.example.demo.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PractitionerProfileRepository practitionerProfileRepository;

    public ReviewService(ReviewRepository reviewRepository, PractitionerProfileRepository practitionerProfileRepository) {
        this.reviewRepository = reviewRepository;
        this.practitionerProfileRepository = practitionerProfileRepository;
    }

    public Review submitReview(Review review) {
        validateReview(review);
        if (review.getCreatedAt() == null) {
            review.setCreatedAt(LocalDateTime.now());
        }
        Review saved = reviewRepository.save(review);

        // Update practitioner's cached rating (best-effort)
        Double avg = reviewRepository.findAverageRatingByPractitionerId(saved.getPractitionerId());
        if (avg != null) {
            double rounded = Math.round(avg * 10.0) / 10.0;
            practitionerProfileRepository.findByUserId(saved.getPractitionerId()).ifPresent(profile -> {
                profile.setRating(rounded);
                practitionerProfileRepository.save(profile);
            });
        }

        return saved;
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public List<Review> getReviewsByPractitionerId(Long practitionerId) {
        return reviewRepository.findByPractitionerId(practitionerId);
    }

    public List<Review> getReviewsByUserId(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    private void validateReview(Review review) {
        if (review.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (review.getPractitionerId() == null) {
            throw new IllegalArgumentException("Practitioner ID is required");
        }

        if (review.getRating() == null) {
            throw new IllegalArgumentException("Rating is required");
        }

        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
    }
}

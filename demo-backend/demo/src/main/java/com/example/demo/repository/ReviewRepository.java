package com.example.demo.repository;

import com.example.demo.model.Review;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByPractitionerId(Long practitionerId);

    List<Review> findByUserId(Long userId);

    @Query("select avg(r.rating) from Review r where r.practitionerId = :practitionerId")
    Double findAverageRatingByPractitionerId(@Param("practitionerId") Long practitionerId);
}

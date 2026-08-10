package com.example.demo.repository;

import com.example.demo.model.PractitionerProfile;
import com.example.demo.model.User;
import com.example.demo.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PractitionerProfileRepository extends JpaRepository<PractitionerProfile, Long> {
    Optional<PractitionerProfile> findByUser(User user);

    Optional<PractitionerProfile> findByUserId(Long userId);

    List<PractitionerProfile> findByVerificationStatus(VerificationStatus status);
}

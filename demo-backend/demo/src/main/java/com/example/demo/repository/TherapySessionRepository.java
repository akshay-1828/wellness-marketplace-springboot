package com.example.demo.repository;

import com.example.demo.model.TherapySession;
import com.example.demo.model.TherapySessionStatus;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TherapySessionRepository extends JpaRepository<TherapySession, Long> {
    List<TherapySession> findByPractitioner(User practitioner);
    List<TherapySession> findByClient(User client);
    List<TherapySession> findByPractitionerAndStatus(User practitioner, TherapySessionStatus status);
    List<TherapySession> findByClientAndDateAfterOrderByDateAsc(User client, java.time.LocalDateTime date);
    List<TherapySession> findByPractitionerAndDateAfterOrderByDateAsc(User practitioner, java.time.LocalDateTime date);
    List<TherapySession> findByClientAndStatusOrderByDateDesc(User client, TherapySessionStatus status);

    // Used by the reminder scheduler: find booked sessions starting within a time
    // window whose reminder email has not been sent yet.
    List<TherapySession> findByStatusAndDateBetweenAndReminderSentFalse(
            TherapySessionStatus status,
            java.time.LocalDateTime windowStart,
            java.time.LocalDateTime windowEnd);
}

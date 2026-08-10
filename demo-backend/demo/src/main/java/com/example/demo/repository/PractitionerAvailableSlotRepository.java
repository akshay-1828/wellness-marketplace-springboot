package com.example.demo.repository;

import com.example.demo.model.PractitionerAvailableSlot;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PractitionerAvailableSlotRepository extends JpaRepository<PractitionerAvailableSlot, Long> {
    List<PractitionerAvailableSlot> findByPractitionerAndAvailableDate(User practitioner, LocalDate availableDate);

    Optional<PractitionerAvailableSlot> findByPractitionerAndAvailableDateAndStartTime(User practitioner,
            LocalDate availableDate, java.time.LocalTime startTime);

    List<PractitionerAvailableSlot> findByPractitionerOrderByAvailableDateAscStartTimeAsc(User practitioner);

    List<PractitionerAvailableSlot> findByPractitionerAndAvailableDateGreaterThanEqualOrderByAvailableDateAscStartTimeAsc(
            User practitioner, LocalDate fromDate);
}

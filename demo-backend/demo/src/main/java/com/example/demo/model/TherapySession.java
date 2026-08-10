package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "therapy_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TherapySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "practitioner_id", nullable = false)
    private User practitioner;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User client; // Using 'client' to distinguish from 'user' field in other contexts, mapped to user_id

    @Column(nullable = false)
    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TherapySessionStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "calendar_added", nullable = false)
    private boolean calendarAdded = false;

    @Column(name = "reminder_sent", nullable = false)
    private boolean reminderSent = false;
}

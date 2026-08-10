package com.example.demo.controller;

import com.example.demo.model.TherapySession;
import com.example.demo.model.TherapySessionStatus;
import com.example.demo.repository.TherapySessionRepository;
import com.example.demo.scheduler.SessionReminderScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ReminderController
 *
 * Provides endpoints to:
 * 1. Manually trigger the reminder batch (useful for testing)
 * 2. Preview which sessions are scheduled for a reminder (verification endpoint)
 */
@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    @Autowired
    private SessionReminderScheduler reminderScheduler;

    @Autowired
    private TherapySessionRepository sessionRepository;

    @Value("${app.reminder.hours-before:24}")
    private int hoursBefore;

    /**
     * POST /api/reminders/trigger
     *
     * Manually fires the reminder batch right now.
     * Useful for smoke-testing without waiting for the cron to fire.
     * Returns the number of reminder emails dispatched.
     */
    @PostMapping("/trigger")
    public ResponseEntity<Map<String, Object>> triggerNow() {
        int sent = reminderScheduler.triggerReminders();
        return ResponseEntity.ok(Map.of(
                "message", "Reminder batch executed",
                "emailsSent", sent
        ));
    }

    /**
     * GET /api/reminders/pending
     *
     * Returns a preview of all BOOKED sessions within the next N hours
     * whose reminder has NOT been sent yet — so you can verify what will be
     * picked up by the next scheduled run.
     */
    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.plusHours(hoursBefore);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        List<TherapySession> sessions = sessionRepository
                .findByStatusAndDateBetweenAndReminderSentFalse(
                        TherapySessionStatus.booked, now, cutoff);

        List<Map<String, Object>> result = sessions.stream()
                .map(s -> Map.<String, Object>of(
                        "sessionId",       s.getId(),
                        "patientEmail",    s.getClient().getEmail(),
                        "patientName",     s.getClient().getName(),
                        "practitionerName",s.getPractitioner().getName(),
                        "sessionDate",     s.getDate().format(fmt),
                        "reminderSent",    s.isReminderSent()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/reminders/sent
     *
     * Returns all sessions for which a reminder has already been dispatched.
     * This is the verification proof — if a session appears here, its reminder
     * email was successfully sent.
     */
    @GetMapping("/sent")
    public ResponseEntity<List<Map<String, Object>>> getSentReminders() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        List<TherapySession> all = sessionRepository.findAll();
        List<Map<String, Object>> result = all.stream()
                .filter(TherapySession::isReminderSent)
                .map(s -> Map.<String, Object>of(
                        "sessionId",       s.getId(),
                        "patientEmail",    s.getClient().getEmail(),
                        "patientName",     s.getClient().getName(),
                        "practitionerName",s.getPractitioner().getName(),
                        "sessionDate",     s.getDate().format(fmt),
                        "calendarAdded",   s.isCalendarAdded()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}

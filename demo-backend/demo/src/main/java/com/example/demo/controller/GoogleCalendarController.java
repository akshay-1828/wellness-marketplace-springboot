package com.example.demo.controller;

import com.example.demo.model.TherapySession;
import com.example.demo.repository.TherapySessionRepository;
import com.example.demo.service.GoogleCalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = "http://localhost:3000")
public class GoogleCalendarController {

    @Autowired
    private GoogleCalendarService googleCalendarService;

    @Autowired
    private TherapySessionRepository therapySessionRepository;

    /**
     * Returns the Google OAuth2 authorization URL for the given sessionId.
     * Frontend navigates the user to this URL to grant calendar access.
     */
    @GetMapping("/auth")
    public ResponseEntity<Map<String, String>> getAuthUrl(@RequestParam Long sessionId) {
        try {
            String authUrl = googleCalendarService.buildAuthorizationUrl(String.valueOf(sessionId));
            return ResponseEntity.ok(Map.of("authUrl", authUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Called by the frontend OAuth2 callback page after Google redirects back with the auth code.
     * Exchanges the code for tokens and creates the Google Calendar event.
     */
    @PostMapping("/create-event")
    public ResponseEntity<Map<String, String>> createCalendarEvent(@RequestBody Map<String, Object> payload) {
        try {
            String code = (String) payload.get("code");
            Long sessionId = Long.parseLong(payload.get("sessionId").toString());

            TherapySession session = therapySessionRepository.findById(sessionId).orElse(null);

            String title = "Therapy Session";
            String description = "WellnessHub appointment";
            java.time.LocalDateTime start = java.time.LocalDateTime.now().plusDays(1);

            if (session != null) {
                String practitionerName = session.getPractitioner() != null
                        ? session.getPractitioner().getName()
                        : "Practitioner";
                title = "Therapy Session with " + practitionerName;
                description = (session.getNotes() != null && !session.getNotes().isBlank())
                        ? session.getNotes()
                        : "Booked via WellnessHub";
                start = session.getDate();
            }

            googleCalendarService.createEvent(code, title, description, start);

            // Persist the calendar_added flag so the UI can show a permanent badge
            if (session != null) {
                session.setCalendarAdded(true);
                therapySessionRepository.save(session);
            }

            return ResponseEntity.ok(Map.of("message", "Event successfully added to Google Calendar!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}

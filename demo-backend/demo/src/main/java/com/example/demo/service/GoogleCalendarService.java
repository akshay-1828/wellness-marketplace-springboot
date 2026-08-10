package com.example.demo.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "WellnessHub Calendar";
    private static final String REDIRECT_URI = "http://localhost:3000/oauth2callback";

    private GoogleAuthorizationCodeFlow buildFlow() throws Exception {
        InputStream in = getClass().getResourceAsStream("/credentials.json");
        if (in == null) {
            throw new IllegalStateException("credentials.json not found in classpath");
        }
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(
                JacksonFactory.getDefaultInstance(),
                new InputStreamReader(in)
        );
        return new GoogleAuthorizationCodeFlow.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                clientSecrets,
                Collections.singleton(CalendarScopes.CALENDAR_EVENTS)
        ).setAccessType("online").build();
    }

    /**
     * Returns the Google OAuth2 consent-screen URL.
     * @param sessionId passed as OAuth state so we can retrieve it after callback
     */
    public String buildAuthorizationUrl(String sessionId) throws Exception {
        return buildFlow()
                .newAuthorizationUrl()
                .setRedirectUri(REDIRECT_URI)
                .setState(sessionId)
                .build();
    }

    /**
     * Exchanges the authorization code for tokens and creates the calendar event.
     */
    public void createEvent(String code, String title, String description, LocalDateTime start) throws Exception {
        GoogleAuthorizationCodeFlow flow = buildFlow();

        GoogleTokenResponse tokenResponse = flow.newTokenRequest(code)
                .setRedirectUri(REDIRECT_URI)
                .execute();

        Credential credential = flow.createAndStoreCredential(tokenResponse, null);

        Calendar service = new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                credential
        ).setApplicationName(APPLICATION_NAME).build();

        Date startDate = Date.from(start.atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(start.plusHours(1).atZone(ZoneId.systemDefault()).toInstant());

        Event event = new Event()
                .setSummary(title)
                .setDescription(description);

        event.setStart(new EventDateTime().setDateTime(new DateTime(startDate)));
        event.setEnd(new EventDateTime().setDateTime(new DateTime(endDate)));

        service.events().insert("primary", event).execute();
    }
}

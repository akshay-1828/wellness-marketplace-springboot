package com.example.demo.service;

import com.example.demo.model.TherapySession;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailReminderService {

    private static final Logger log = LoggerFactory.getLogger(EmailReminderService.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEEE, MMMM d yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends an HTML reminder email to the patient about their upcoming session.
     */
    public void sendSessionReminder(TherapySession session) {
        String patientEmail = session.getClient().getEmail();
        String patientName  = session.getClient().getName();
        String practName    = session.getPractitioner().getName();
        String dateStr      = session.getDate().format(DATE_FMT);
        String timeStr      = session.getDate().format(TIME_FMT);

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setTo(patientEmail);
            helper.setSubject("⏰ Reminder: Your therapy session is coming up – " + dateStr);
            helper.setText(buildHtml(patientName, practName, dateStr, timeStr), true);

            mailSender.send(msg);
            log.info("Reminder sent → {} for session #{}", patientEmail, session.getId());

        } catch (MessagingException e) {
            log.error("Failed to send reminder for session #{}: {}", session.getId(), e.getMessage());
        }
    }

    // ── Also notify the practitioner ──────────────────────────────────────────

    public void sendPractitionerReminder(TherapySession session) {
        String practEmail = session.getPractitioner().getEmail();
        String practName  = session.getPractitioner().getName();
        String patientName = session.getClient().getName();
        String dateStr    = session.getDate().format(DATE_FMT);
        String timeStr    = session.getDate().format(TIME_FMT);

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setTo(practEmail);
            helper.setSubject("📅 Upcoming session reminder – " + patientName + " on " + dateStr);
            helper.setText(buildPractitionerHtml(practName, patientName, dateStr, timeStr), true);

            mailSender.send(msg);
            log.info("Practitioner reminder sent → {} for session #{}", practEmail, session.getId());

        } catch (MessagingException e) {
            log.error("Failed to send practitioner reminder for session #{}: {}", session.getId(), e.getMessage());
        }
    }

    // ── HTML templates ────────────────────────────────────────────────────────

    private String buildHtml(String patient, String practitioner, String date, String time) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;">
                  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;
                              overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
                    <!-- Header -->
                    <div style="background:#059669;padding:32px 40px;">
                      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">WellnessHub</h1>
                      <p style="margin:6px 0 0;color:#d1fae5;font-size:14px;">Your wellness journey reminder</p>
                    </div>
                    <!-- Body -->
                    <div style="padding:32px 40px;">
                      <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>%s</strong>,</p>
                      <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                        This is a friendly reminder that you have an upcoming therapy session scheduled.
                      </p>
                      <!-- Session Card -->
                      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                        <table style="width:100%;border-collapse:collapse;">
                          <tr>
                            <td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Practitioner</td>
                            <td style="padding:6px 0;color:#111827;font-size:15px;font-weight:700;">Dr. %s</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Date</td>
                            <td style="padding:6px 0;color:#111827;font-size:15px;font-weight:700;">%s</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Time</td>
                            <td style="padding:6px 0;color:#111827;font-size:15px;font-weight:700;">%s</td>
                          </tr>
                        </table>
                      </div>
                      <!-- CTA -->
                      <div style="text-align:center;margin-bottom:24px;">
                        <a href="http://localhost:3000/my-sessions"
                           style="display:inline-block;background:#059669;color:#ffffff;font-size:15px;
                                  font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;">
                          View My Sessions
                        </a>
                      </div>
                      <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">
                        If you need to reschedule or cancel, please do so at least 2 hours before the session.
                      </p>
                    </div>
                    <!-- Footer -->
                    <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 WellnessHub. This is an automated reminder.</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(patient, practitioner, date, time);
    }

    private String buildPractitionerHtml(String practitioner, String patient, String date, String time) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;">
                  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;
                              overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
                    <div style="background:#4f46e5;padding:32px 40px;">
                      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">WellnessHub</h1>
                      <p style="margin:6px 0 0;color:#c7d2fe;font-size:14px;">Practitioner session reminder</p>
                    </div>
                    <div style="padding:32px 40px;">
                      <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>Dr. %s</strong>,</p>
                      <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                        You have an upcoming session with a patient. Here are the details:
                      </p>
                      <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                        <table style="width:100%;border-collapse:collapse;">
                          <tr>
                            <td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;">Patient</td>
                            <td style="padding:6px 0;color:#111827;font-size:15px;font-weight:700;">%s</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;">Date</td>
                            <td style="padding:6px 0;color:#111827;font-size:15px;font-weight:700;">%s</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;">Time</td>
                            <td style="padding:6px 0;color:#111827;font-size:15px;font-weight:700;">%s</td>
                          </tr>
                        </table>
                      </div>
                      <div style="text-align:center;margin-bottom:24px;">
                        <a href="http://localhost:3000/practitioner-dashboard"
                           style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:15px;
                                  font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;">
                          View Dashboard
                        </a>
                      </div>
                    </div>
                    <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 WellnessHub. Automated reminder.</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(practitioner, patient, date, time);
    }
}

package com.example.demo.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.*;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    // 🧾 ORDER CONFIRMATION EMAIL
    public void sendOrderConfirmation(String toEmail, String name,
                                      String product, int quantity, double totalPrice) {

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🧾 Order Confirmation");

            String html = """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;font-family:Arial;background:#f3f4f6;">
                  <div style="max-width:520px;margin:40px auto;background:#ffffff;
                              border-radius:12px;overflow:hidden;
                              box-shadow:0 4px 20px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <div style="background:#059669;padding:20px 30px;">
                      <h2 style="color:white;margin:0;">Your Order is Confirmed ✅</h2>
                    </div>

                    <!-- Body -->
                    <div style="padding:25px 30px;">
                      <p style="font-size:16px;">Hi <b>%s</b>,</p>

                      <p style="color:#555;">
                        Thank you for your purchase! Your order has been successfully placed.
                      </p>

                      <div style="background:#f0fdf4;padding:15px;border-radius:8px;margin-top:15px;">
                        <p><b>Product:</b> %s</p>
                        <p><b>Quantity:</b> %d</p>
                        <p><b>Total Cost:</b> ₹%.2f</p>
                      </div>

                      <p style="margin-top:20px;color:#555;">
                        We will notify you once your order is shipped 🚚
                      </p>
                    </div>

                    <!-- Footer -->
                    <div style="background:#f9fafb;padding:15px;text-align:center;
                                font-size:12px;color:#888;">
                      © 2026 Your Platform. All rights reserved.
                    </div>

                  </div>
                </body>
                </html>
            """.formatted(name, product, quantity, totalPrice);

            helper.setText(html, true);
            mailSender.send(msg);

            log.info("Order confirmation email sent → {}", toEmail);

        } catch (MessagingException e) {
            log.error("Error sending order confirmation email: {}", e.getMessage());
        }
    }
}
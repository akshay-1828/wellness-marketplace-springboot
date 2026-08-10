package com.example.demo;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testPractitionerRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("New Practitioner");
        request.setEmail("test-" + System.currentTimeMillis() + "@practitioner.com");
        request.setPassword("password123");
        request.setRole(Role.PRACTITIONER);
        request.setSpecialization("Homeopathy");
        request.setBio("Experienced Homeopathic Practitioner");
        request.setLicenseNumber("BR-HOM-2020-0001");

        mockMvc.perform(post("/api/auth/register/practitioner")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("PRACTITIONER"))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }
}

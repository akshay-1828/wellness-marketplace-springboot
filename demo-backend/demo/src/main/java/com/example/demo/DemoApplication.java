package com.example.demo;

import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	public CommandLineRunner runner(UserRepository userRepository) {
		return args -> {
			System.out.println("--- USERS IN DATABASE ---");
			userRepository.findAll()
					.forEach(u -> System.out.println("User: " + u.getEmail() + " | Role: " + u.getRole()));
			System.out.println("-------------------------");
		};
	}
}

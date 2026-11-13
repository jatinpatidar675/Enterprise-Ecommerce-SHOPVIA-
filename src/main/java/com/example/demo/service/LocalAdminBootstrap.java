package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@Component
@Profile("local")
@ConditionalOnProperty(name = "shopvia.admin.bootstrap.enabled", havingValue = "true")
public class LocalAdminBootstrap implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(LocalAdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public LocalAdminBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${shopvia.admin.email:admin@gmail.com}") String email,
            @Value("${shopvia.admin.password:}") String password) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalStateException(
                    "ADMIN_EMAIL and ADMIN_PASSWORD are required when ADMIN_BOOTSTRAP_ENABLED=true");
        }

        String normalizedEmail = email.trim().toLowerCase();
        User admin = userRepository.findByEmail(normalizedEmail);
        if (admin == null) {
            admin = new User();
            admin.setEmail(normalizedEmail);
            admin.setName("ShopVia Admin");
            admin.setPhone("0000000000");
        }

        admin.setRole("ADMIN");
        admin.setPassword(passwordEncoder.encode(password));
        userRepository.save(admin);
        LOGGER.warn("Local admin credentials configured for {}. Disable ADMIN_BOOTSTRAP_ENABLED after setup.", normalizedEmail);
    }
}

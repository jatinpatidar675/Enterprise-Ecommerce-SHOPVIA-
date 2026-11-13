package com.example.demo.service;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.example.demo.entity.User;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtService.class);

    private static final long EXPIRATION_TIME
            = 1000 * 60 * 60; // 1 hour

    private final String secretKey;

    public JwtService(
            @Value("${jwt.secret:}") String secretKey,
            Environment environment) {
        if (secretKey != null && !secretKey.isBlank()) {
            if (secretKey.getBytes(StandardCharsets.UTF_8).length < 32) {
                throw new IllegalArgumentException("JWT_SECRET must be at least 32 bytes");
            }
            this.secretKey = secretKey;
            return;
        }

        if (!environment.acceptsProfiles(Profiles.of("local"))) {
            throw new IllegalStateException(
                    "JWT_SECRET is required outside the local profile and must be at least 32 bytes");
        }

        byte[] ephemeralKey = new byte[32];
        new SecureRandom().nextBytes(ephemeralKey);
        this.secretKey = Base64.getEncoder().encodeToString(ephemeralKey);
        LOGGER.warn("JWT_SECRET is unset; generated an ephemeral local key. Sessions will expire when the app restarts.");
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(User user) {

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole())
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis()
                                + EXPIRATION_TIME)
                )
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token, User user) {

        try {

            String email = extractEmail(token);

            return email.equals(user.getEmail());

        } catch (Exception e) {

            return false;
        }
    }
}

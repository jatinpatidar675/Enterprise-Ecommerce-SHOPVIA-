package com.example.demo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                // =====================================
                // CORS
                // =====================================

                .cors(cors
                        -> cors.configurationSource(
                        corsConfigurationSource()
                )
                )
                // =====================================
                // CSRF
                // =====================================

                .csrf(csrf
                        -> csrf.disable()
                )
                // =====================================
                // SESSION
                // =====================================

                .sessionManagement(session
                        -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS
                )
                )
                // =====================================
                // AUTHORIZATION
                // =====================================

                .authorizeHttpRequests(auth -> auth
                // CORS preflight

                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                ).permitAll()
                // Authentication

                .requestMatchers(
                        "/api/auth/**"
                ).permitAll()
                // Public registration

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/users/register"
                ).permitAll()
                // Product APIs - public read, admin write

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/products/**"
                ).permitAll()
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/categories",
                        "/api/categories/**",
                        "/api/deals",
                        "/api/deals/**"
                ).permitAll()
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/products/**"
                ).hasRole("ADMIN")
                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/products/**"
                ).hasRole("ADMIN")
                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/products/**"
                ).hasRole("ADMIN")
                // Admin APIs

                .requestMatchers(
                        "/api/admin/**"
                ).hasRole("ADMIN")
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/users",
                        "/api/users/email/**",
                        "/api/payments"
                ).hasRole("ADMIN")
                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/users/**"
                ).hasRole("ADMIN")
                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/orders/**",
                        "/api/payments/**"
                ).hasRole("ADMIN")
                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/orders/**"
                ).hasRole("ADMIN")
                // Images

                .requestMatchers(
                        "/images/**"
                ).permitAll()
                // Customer APIs

                .requestMatchers(
                        "/api/users/**",
                        "/api/cart/**",
                        "/api/wishlist/**",
                        "/api/orders/**",
                        "/api/payments/**"
                ).authenticated()
                // Everything else

                .anyRequest().denyAll()
                );

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }

    // =========================================
    // CORS CONFIGURATION
    // =========================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration
                = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source
                = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}

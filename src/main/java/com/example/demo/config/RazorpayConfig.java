package com.example.demo.config;

import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @Bean
    @ConditionalOnProperty(name = "razorpay.enabled", havingValue = "true")
    public RazorpayClient razorpayClient() throws Exception {
        if (razorpayKeyId.isBlank() || razorpayKeySecret.isBlank()) {
            throw new IllegalStateException(
                    "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required when RAZORPAY_ENABLED=true");
        }
        return new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }
}

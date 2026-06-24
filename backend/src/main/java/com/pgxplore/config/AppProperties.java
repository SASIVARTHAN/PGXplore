package com.pgxplore.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "pgxplore.app")
public class AppProperties {
    private String frontendUrl = "http://localhost:5173";
    /** Comma-separated extra origins, e.g. https://app.example.com,https://www.example.com */
    private String corsAllowedOrigins = "";
    private int passwordResetExpiryMinutes = 60;
}

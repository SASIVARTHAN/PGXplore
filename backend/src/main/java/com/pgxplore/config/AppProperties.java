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
    private int passwordResetExpiryMinutes = 60;
}

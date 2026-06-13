package com.pgxplore.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Firebase web app config exposed to the frontend so it can initialize the
 * Firebase JS SDK for Google sign-in (signInWithPopup).
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "pgxplore.firebase")
public class FirebaseWebProperties {

    private String apiKey = "";
    private String authDomain = "";
    private String projectId = "";
    private String appId = "";
    private String messagingSenderId = "";

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank()
                && authDomain != null && !authDomain.isBlank()
                && projectId != null && !projectId.isBlank();
    }
}

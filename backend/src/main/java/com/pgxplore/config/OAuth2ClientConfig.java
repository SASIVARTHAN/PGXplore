package com.pgxplore.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

/**
 * Spring OAuth2 client registration is driven by {@code spring.security.oauth2.client.*} in application.yml.
 * This configuration is active when {@code GOOGLE_CLIENT_ID} is provided.
 */
@Configuration
@ConditionalOnProperty(name = "pgxplore.google.client-id")
public class OAuth2ClientConfig {
    // Marker: real Google OAuth credentials are present (see application.yml + google-oauth.local.properties).
}

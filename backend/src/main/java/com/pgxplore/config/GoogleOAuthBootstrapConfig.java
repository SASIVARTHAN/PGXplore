package com.pgxplore.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * Logs Google OAuth readiness at startup and documents how to enable real sign-in.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class GoogleOAuthBootstrapConfig {

    private final GoogleOAuthProperties googleOAuthProperties;

    @PostConstruct
    void logGoogleAuthStatus() {
        if (googleOAuthProperties.isConfigured()) {
            log.info("Google OAuth ENABLED — real Google sign-in is active (client-id configured)");
            return;
        }
        if (googleOAuthProperties.isDevMode()) {
            log.warn("""
                    Google OAuth NOT configured — using dev-mode fallback only.
                    To enable real Google sign-in:
                      1. Copy google-oauth.local.properties.example → google-oauth.local.properties
                      2. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from Google Cloud Console
                      3. Restart the backend
                    """);
            return;
        }
        log.warn("Google OAuth disabled — set GOOGLE_CLIENT_ID or enable pgxplore.google.dev-mode");
    }
}

package com.pgxplore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * OAuth2 client auto-config is excluded because PGXplore verifies Google ID tokens directly.
 * Empty GOOGLE_CLIENT_ID would otherwise break startup; credentials are loaded from env or
 * {@code google-oauth.local.properties} when enabling real Google sign-in.
 */
@SpringBootApplication(exclude = OAuth2ClientAutoConfiguration.class)
@EnableJpaAuditing
public class PgxploreApplication {

    public static void main(String[] args) {
        SpringApplication.run(PgxploreApplication.class, args);
    }
}

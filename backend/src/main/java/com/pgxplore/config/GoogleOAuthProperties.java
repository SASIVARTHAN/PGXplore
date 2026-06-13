package com.pgxplore.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "pgxplore.google")
public class GoogleOAuthProperties {
    private String clientId = "";
    /** Allows one-click Google sign-in in local dev without Google Cloud credentials. */
    private boolean devMode = false;

    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank();
    }

    /** Real Google sign-in is available when a client ID is configured. */
    public boolean isRealAuthEnabled() {
        return isConfigured();
    }

    /** Dev fallback is only offered when real Google OAuth is not configured. */
    public boolean isDevModeEffective() {
        return devMode && !isConfigured();
    }

    public boolean isEnabled() {
        return isConfigured() || isDevModeEffective();
    }
}

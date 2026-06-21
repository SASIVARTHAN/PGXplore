package com.pgxplore.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Public Google Sign-In configuration for the frontend")
public class GoogleAuthConfigResponse {
    private String clientId;
    private boolean devMode;
    private boolean enabled;
    /** True when a real Google OAuth client ID is configured on the server. */
    private boolean realAuth;
}

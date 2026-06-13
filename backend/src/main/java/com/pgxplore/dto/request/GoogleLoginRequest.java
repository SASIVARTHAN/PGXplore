package com.pgxplore.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for Google Sign-In using a Google Identity Services ID token.
 */
@Data
@Schema(description = "Google OAuth login request")
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token is required")
    @Schema(
            description = "JWT ID token obtained from Google Sign-In on the frontend",
            example = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...")
    private String idToken;
}

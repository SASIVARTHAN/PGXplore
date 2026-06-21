package com.pgxplore.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Google Sign-In request with ID token from Google Identity Services")
public class GoogleAuthRequest {

    @NotBlank(message = "Google ID token is required")
    @Schema(description = "JWT ID token returned by Google Sign-In")
    private String idToken;
}

package com.pgxplore.dto.request;

import com.pgxplore.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Authenticate with a verified Amazon Cognito ID token (phone OTP)")
public class CognitoLoginRequest {

    @NotBlank
    @Schema(description = "Cognito ID token from phone OTP sign-in")
    private String idToken;

    @Schema(description = "Display name for first-time registration")
    private String name;

    @Schema(description = "Account role for first-time registration (USER or PG_OWNER)")
    private Role role;

    @Schema(description = "Portal context: user (default) or owner")
    private String portal;
}

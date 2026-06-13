package com.pgxplore.dto.response;

import com.pgxplore.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

/**
 * Response returned after successful Google OAuth authentication.
 */
@Data
@Builder
@Schema(description = "Google OAuth login response with JWT")
public class GoogleLoginResponse {

    @Schema(description = "JWT access token (alias: token)", example = "eyJhbGciOiJIUzM4NCJ9...")
    private String token;

    @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzM4NCJ9...")
    private String accessToken;

    @Schema(description = "Refresh token for obtaining new access tokens")
    private String refreshToken;

    @Schema(example = "Bearer")
    private String tokenType;

    @Schema(description = "Token expiry in seconds", example = "86400")
    private long expiresIn;

    @Schema(example = "user@gmail.com")
    private String email;

    @Schema(example = "USER")
    private Role role;

    @Schema(example = "Jane Doe")
    private String name;

    @Schema(description = "Google profile picture URL")
    private String profilePicture;

    private Long userId;
}

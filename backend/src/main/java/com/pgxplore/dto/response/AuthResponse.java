package com.pgxplore.dto.response;

import com.pgxplore.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Authentication response with tokens")
public class AuthResponse {

    @Schema(description = "JWT access token (same as accessToken)", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String token;

    @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
    private String accessToken;

    @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
    private String refreshToken;

    @Schema(example = "Bearer")
    private String tokenType;

    @Schema(example = "900")
    private long expiresIn;

    private Long userId;
    private String name;
    private String email;
    private Role role;

    @Schema(description = "Profile picture URL (Google users)")
    private String profilePicture;
}

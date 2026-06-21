package com.pgxplore.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
@Schema(description = "Development-only Google sign-in (no real Google token required)")
public class GoogleDevAuthRequest {

    @Email
    @Schema(example = "google.demo@pgxplore.local")
    private String email;

    @Schema(example = "Google Demo User")
    private String name;
}

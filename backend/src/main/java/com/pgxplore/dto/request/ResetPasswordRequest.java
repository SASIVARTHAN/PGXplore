package com.pgxplore.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Reset password request")
public class ResetPasswordRequest {

    @NotBlank
    @Schema(example = "reset-token-uuid")
    private String token;

    @NotBlank
    @Size(min = 8)
    @Schema(example = "NewPassword@123")
    private String newPassword;
}

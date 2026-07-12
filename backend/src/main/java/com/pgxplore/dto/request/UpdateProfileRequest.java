package com.pgxplore.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Update user profile request")
public class UpdateProfileRequest {

    @Size(max = 100)
    @Schema(example = "Ananya Reddy")
    private String name;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    @Schema(example = "9876543210")
    private String phone;
}

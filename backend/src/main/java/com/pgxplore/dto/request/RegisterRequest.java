package com.pgxplore.dto.request;

import com.pgxplore.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Schema(description = "User registration request")
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    @Schema(example = "Ananya Reddy")
    private String name;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(example = "Password@123")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    @Schema(example = "9876543210")
    private String phone;

    @NotNull(message = "Role is required")
    @Schema(example = "USER", allowableValues = {"USER", "PG_OWNER"})
    private Role role;

    @Size(max = 255)
    @Schema(description = "PG name provided during owner registration")
    private String pgName;

    @Size(max = 500)
    @Schema(description = "Business address provided during owner registration")
    private String address;
}

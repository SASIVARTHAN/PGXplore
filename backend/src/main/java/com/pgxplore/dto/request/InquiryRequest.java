package com.pgxplore.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Schema(description = "Submit inquiry request")
public class InquiryRequest {

    @NotNull
    @Schema(example = "1")
    private Long pgId;

    @NotBlank @Size(max = 2000)
    @Schema(example = "Is there a single room available from next month?")
    private String message;

    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
    @Schema(example = "9876543210")
    private String contactNumber;
}

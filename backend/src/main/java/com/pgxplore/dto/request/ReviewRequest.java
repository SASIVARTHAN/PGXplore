package com.pgxplore.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Schema(description = "Create or update review request")
public class ReviewRequest {

    @NotNull
    @Schema(example = "1")
    private Long pgId;

    @NotNull @Min(1) @Max(5)
    @Schema(example = "5")
    private Integer rating;

    @NotBlank @Size(min = 4, max = 1000)
    @Schema(example = "Great PG with clean rooms and tasty food.")
    private String reviewText;
}

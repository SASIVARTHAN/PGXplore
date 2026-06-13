package com.pgxplore.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Natural language search request")
public class NaturalSearchRequest {

    @NotBlank @Size(max = 500)
    @Schema(example = "Boys PG under 7000 in Chennai with WiFi")
    private String query;
}

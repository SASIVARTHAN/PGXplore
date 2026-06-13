package com.pgxplore.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Image upload metadata")
public class ImageUploadRequest {

    @NotNull
    @Schema(example = "1")
    private Long pgId;

    @Schema(example = "false")
    private boolean primary;
}

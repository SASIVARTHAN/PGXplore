package com.pgxplore.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "PG image response")
public class PgImageResponse {
    private Long id;
    private String imageUrl;
    private boolean primary;
}

package com.pgxplore.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "Review response")
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long pgId;
    private Integer rating;
    private String reviewText;
    private LocalDateTime createdAt;
}

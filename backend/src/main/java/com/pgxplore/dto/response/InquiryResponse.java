package com.pgxplore.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "Inquiry response")
public class InquiryResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long pgId;
    private String pgName;
    private String message;
    private String contactNumber;
    private LocalDateTime createdAt;
}

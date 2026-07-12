package com.pgxplore.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "OTP send acknowledgement")
public class OtpSendResponse {

    @Schema(description = "Demo OTP for development until SMS is enabled", example = "123456")
    private String demoOtp;

    @Schema(example = "OTP sent successfully")
    private String message;
}

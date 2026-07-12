package com.pgxplore.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Amazon Cognito web client configuration for phone OTP")
public class CognitoConfigResponse {
    private boolean enabled;
    private String region;
    private String userPoolId;
    private String clientId;
}

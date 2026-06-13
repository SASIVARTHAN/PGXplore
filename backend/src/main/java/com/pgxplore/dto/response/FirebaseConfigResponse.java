package com.pgxplore.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Firebase web config for initializing the Firebase JS SDK on the frontend")
public class FirebaseConfigResponse {
    private String apiKey;
    private String authDomain;
    private String projectId;
    private String appId;
    private String messagingSenderId;
    /** True when the server has a usable Firebase web config. */
    private boolean enabled;
}

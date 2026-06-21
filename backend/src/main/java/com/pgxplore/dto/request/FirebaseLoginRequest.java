package com.pgxplore.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Firebase login — ID token from Firebase Authentication (e.g. Google popup)")
public class FirebaseLoginRequest {

    @NotBlank(message = "Firebase ID token is required")
    @Schema(description = "Firebase ID token from the client after signInWithPopup", example = "firebase-id-token")
    private String idToken;
}

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

    /**
     * Email from the Firebase client SDK ({@code user.email}). Required when the ID token
     * omits the email claim (common for Google sign-in). The server verifies it matches the token UID.
     */
    @Schema(description = "User email from Firebase client profile", example = "user@gmail.com")
    private String email;
}

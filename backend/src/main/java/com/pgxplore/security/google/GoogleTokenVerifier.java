package com.pgxplore.security.google;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.pgxplore.config.GoogleOAuthProperties;
import com.pgxplore.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class GoogleTokenVerifier {

    private final GoogleOAuthProperties googleOAuthProperties;

    public GoogleUserInfo verify(String idTokenString) {
        if (!StringUtils.hasText(googleOAuthProperties.getClientId())) {
            throw new ValidationException("Google sign-in is not configured on the server");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleOAuthProperties.getClientId()))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new ValidationException("Invalid or expired Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            if (!StringUtils.hasText(email)) {
                throw new ValidationException("Google account email is required");
            }

            Object picture = payload.get("picture");

            return GoogleUserInfo.builder()
                    .googleId(payload.getSubject())
                    .email(email.toLowerCase())
                    .name(payload.get("name") != null ? String.valueOf(payload.get("name")) : email)
                    .profilePicture(picture != null ? String.valueOf(picture) : null)
                    .emailVerified(Boolean.TRUE.equals(payload.getEmailVerified()))
                    .build();
        } catch (ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ValidationException("Google sign-in verification failed");
        }
    }
}

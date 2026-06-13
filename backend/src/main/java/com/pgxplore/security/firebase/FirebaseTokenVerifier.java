package com.pgxplore.security.firebase;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.security.google.GoogleUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Verifies Firebase ID tokens (issued after Firebase Authentication sign-in,
 * e.g. Google popup) and maps them to {@link GoogleUserInfo}.
 */
@Slf4j
@Component
public class FirebaseTokenVerifier {

    public GoogleUserInfo verify(String idToken) {
        if (!StringUtils.hasText(idToken)) {
            throw new ValidationException("Firebase ID token is required");
        }
        if (FirebaseApp.getApps().isEmpty()) {
            throw new ValidationException(
                    "Firebase is not configured on the server. Add firebase-service-account.json.");
        }

        try {
            FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = resolveEmail(decoded);
            if (!StringUtils.hasText(email)) {
                java.util.Map<String, Object> claims = decoded.getClaims();
                log.warn("Firebase token has no email. uid={}, claimKeys={}, firebase={}",
                        decoded.getUid(),
                        claims != null ? claims.keySet() : null,
                        claims != null ? claims.get("firebase") : null);
                throw new ValidationException(
                        "Google account did not share an email address. Make sure the 'email' "
                                + "scope is granted and try a different Google account.");
            }

            return GoogleUserInfo.builder()
                    .googleId(decoded.getUid())
                    .email(email.toLowerCase())
                    .name(StringUtils.hasText(decoded.getName()) ? decoded.getName() : email)
                    .profilePicture(decoded.getPicture())
                    .emailVerified(decoded.isEmailVerified())
                    .build();
        } catch (ValidationException ex) {
            throw ex;
        } catch (FirebaseAuthException ex) {
            log.debug("Firebase token verification failed: {}", ex.getMessage());
            throw new ValidationException("Invalid or expired Firebase ID token");
        }
    }

    /**
     * Resolves the email from a verified token. {@link FirebaseToken#getEmail()} is sometimes
     * empty even when the email is present elsewhere in the claims (notably under
     * {@code firebase.identities.email} for Google sign-ins), so we fall back to those.
     */
    @SuppressWarnings("unchecked")
    private String resolveEmail(FirebaseToken decoded) {
        String email = decoded.getEmail();
        if (StringUtils.hasText(email)) {
            return email;
        }

        java.util.Map<String, Object> claims = decoded.getClaims();
        if (claims == null) {
            return null;
        }

        Object rawEmail = claims.get("email");
        if (rawEmail instanceof String s && StringUtils.hasText(s)) {
            return s;
        }

        Object firebase = claims.get("firebase");
        if (firebase instanceof java.util.Map<?, ?> firebaseMap) {
            Object identities = firebaseMap.get("identities");
            if (identities instanceof java.util.Map<?, ?> identitiesMap) {
                Object emails = identitiesMap.get("email");
                if (emails instanceof java.util.List<?> emailList && !emailList.isEmpty()) {
                    Object first = emailList.get(0);
                    if (first instanceof String s && StringUtils.hasText(s)) {
                        return s;
                    }
                }
            }
        }

        return null;
    }
}

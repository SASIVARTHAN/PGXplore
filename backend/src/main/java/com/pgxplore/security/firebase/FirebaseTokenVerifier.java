package com.pgxplore.security.firebase;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserInfo;
import com.google.firebase.auth.UserRecord;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.model.enums.AuthProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

/**
 * Verifies Firebase ID tokens (Google popup, phone OTP, etc.) and maps them to {@link FirebaseUserInfo}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FirebaseTokenVerifier {

    private final FirebaseRestTokenVerifier restTokenVerifier;

    public FirebaseUserInfo verify(String idToken) {
        return verify(idToken, null);
    }

    public FirebaseUserInfo verify(String idToken, String clientEmail) {
        if (!StringUtils.hasText(idToken)) {
            throw new ValidationException("Firebase ID token is required");
        }

        if (!FirebaseApp.getApps().isEmpty()) {
            try {
                return verifyWithAdminSdk(idToken, clientEmail);
            } catch (ValidationException ex) {
                throw ex;
            } catch (FirebaseAuthException ex) {
                log.debug("Admin SDK token verification failed: {}", ex.getMessage());
            } catch (Exception ex) {
                log.warn("Admin SDK token verification error, falling back to REST: {}", ex.getMessage());
            }
        }

        return restTokenVerifier.verify(idToken, clientEmail);
    }

    private FirebaseUserInfo verifyWithAdminSdk(String idToken, String clientEmail) throws FirebaseAuthException {
        FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
        String phone = resolvePhone(decoded);
        String email = resolveEmail(decoded);

        if (StringUtils.hasText(phone)) {
            return FirebaseUserInfo.builder()
                    .firebaseUid(decoded.getUid())
                    .authProvider(AuthProvider.PHONE)
                    .phone(normalizePhone(phone))
                    .email(StringUtils.hasText(email) ? email.toLowerCase() : null)
                    .name(resolveName(decoded, phone, email))
                    .profilePicture(decoded.getPicture())
                    .emailVerified(decoded.isEmailVerified())
                    .phoneVerified(true)
                    .build();
        }

        if (!StringUtils.hasText(email)) {
            email = resolveEmailFromUserRecord(decoded.getUid());
        }

        if (!StringUtils.hasText(email)) {
            email = normalizeClientEmail(clientEmail);
        }

        if (!StringUtils.hasText(email)) {
            Map<String, Object> claims = decoded.getClaims();
            log.warn("Firebase token has no email or phone. uid={}, claimKeys={}",
                    decoded.getUid(),
                    claims != null ? claims.keySet() : null);
            throw new ValidationException(
                    "Firebase account did not include an email or phone number.");
        }

        return FirebaseUserInfo.builder()
                .firebaseUid(decoded.getUid())
                .authProvider(AuthProvider.GOOGLE)
                .email(email.toLowerCase())
                .name(StringUtils.hasText(decoded.getName()) ? decoded.getName() : email)
                .profilePicture(decoded.getPicture())
                .emailVerified(decoded.isEmailVerified())
                .phoneVerified(false)
                .build();
    }

    @SuppressWarnings("unchecked")
    private String resolveEmail(FirebaseToken decoded) {
        String email = decoded.getEmail();
        if (StringUtils.hasText(email)) {
            return email;
        }

        Map<String, Object> claims = decoded.getClaims();
        if (claims == null) {
            return null;
        }

        Object rawEmail = claims.get("email");
        if (rawEmail instanceof String s && StringUtils.hasText(s)) {
            return s;
        }

        Object firebase = claims.get("firebase");
        if (firebase instanceof Map<?, ?> firebaseMap) {
            Object identities = firebaseMap.get("identities");
            if (identities instanceof Map<?, ?> identitiesMap) {
                Object emails = identitiesMap.get("email");
                if (emails instanceof List<?> emailList && !emailList.isEmpty()) {
                    Object first = emailList.get(0);
                    if (first instanceof String s && StringUtils.hasText(s)) {
                        return s;
                    }
                }
            }
        }

        return null;
    }

    private String normalizeClientEmail(String clientEmail) {
        if (!StringUtils.hasText(clientEmail)) {
            return null;
        }
        return clientEmail.trim().toLowerCase();
    }

    /**
     * Some Google sign-in tokens omit top-level email claims even though the Firebase user
     * profile stores the address. Load the user record as a fallback.
     */
    private String resolveEmailFromUserRecord(String uid) {
        if (!StringUtils.hasText(uid) || FirebaseApp.getApps().isEmpty()) {
            return null;
        }
        try {
            UserRecord record = FirebaseAuth.getInstance().getUser(uid);
            if (StringUtils.hasText(record.getEmail())) {
                return record.getEmail();
            }
            for (UserInfo provider : record.getProviderData()) {
                if (StringUtils.hasText(provider.getEmail())) {
                    return provider.getEmail();
                }
            }
        } catch (FirebaseAuthException ex) {
            log.debug("Could not load Firebase user {} for email fallback: {}", uid, ex.getMessage());
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String resolvePhone(FirebaseToken decoded) {
        Map<String, Object> claims = decoded.getClaims();
        if (claims == null) {
            return null;
        }

        Object phoneNumber = claims.get("phone_number");
        if (phoneNumber instanceof String s && StringUtils.hasText(s)) {
            return s;
        }

        Object firebase = claims.get("firebase");
        if (firebase instanceof Map<?, ?> firebaseMap) {
            Object identities = firebaseMap.get("identities");
            if (identities instanceof Map<?, ?> identitiesMap) {
                Object phones = identitiesMap.get("phone");
                if (phones instanceof List<?> phoneList && !phoneList.isEmpty()) {
                    Object first = phoneList.get(0);
                    if (first instanceof String s && StringUtils.hasText(s)) {
                        return s;
                    }
                }
            }
        }

        return null;
    }

    private String resolveName(FirebaseToken decoded, String phone, String email) {
        if (StringUtils.hasText(decoded.getName())) {
            return decoded.getName();
        }
        if (StringUtils.hasText(email)) {
            return email;
        }
        return "User " + normalizePhone(phone);
    }

    static String normalizePhone(String phone) {
        if (!StringUtils.hasText(phone)) {
            return phone;
        }
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() >= 10) {
            return digits.substring(digits.length() - 10);
        }
        return digits;
    }
}

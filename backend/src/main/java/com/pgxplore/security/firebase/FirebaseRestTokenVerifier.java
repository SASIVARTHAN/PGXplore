package com.pgxplore.security.firebase;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pgxplore.config.FirebaseWebProperties;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.model.enums.AuthProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

/**
 * Verifies Firebase ID tokens via the Identity Toolkit REST API when the Admin SDK
 * is unavailable (no service-account JSON on the server).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FirebaseRestTokenVerifier {

    private static final String LOOKUP_URL =
            "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=%s";

    private final FirebaseWebProperties firebaseWebProperties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    public FirebaseUserInfo verify(String idToken) {
        return verify(idToken, null);
    }

    public FirebaseUserInfo verify(String idToken, String clientEmail) {
        String apiKey = firebaseWebProperties.getApiKey();
        if (!StringUtils.hasText(apiKey)) {
            throw new ValidationException(
                    "Firebase is not configured on the server. Set FIREBASE_API_KEY or add firebase-service-account.json.");
        }

        try {
            String body = restClient.post()
                    .uri(String.format(LOOKUP_URL, apiKey))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("idToken", idToken))
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(body);
            JsonNode users = root.path("users");
            if (!users.isArray() || users.isEmpty()) {
                throw new ValidationException("Invalid or expired Firebase ID token");
            }

            JsonNode user = users.get(0);
            String phone = textOrNull(user, "phoneNumber");
            String email = textOrNull(user, "email");
            String uid = textOrNull(user, "localId");
            String name = textOrNull(user, "displayName");
            String picture = textOrNull(user, "photoUrl");
            boolean emailVerified = user.path("emailVerified").asBoolean(false);

            if (StringUtils.hasText(phone)) {
                return FirebaseUserInfo.builder()
                        .firebaseUid(uid)
                        .authProvider(AuthProvider.PHONE)
                        .phone(FirebaseTokenVerifier.normalizePhone(phone))
                        .email(StringUtils.hasText(email) ? email.toLowerCase() : null)
                        .name(StringUtils.hasText(name) ? name : "User " + FirebaseTokenVerifier.normalizePhone(phone))
                        .profilePicture(picture)
                        .emailVerified(emailVerified)
                        .phoneVerified(true)
                        .build();
            }

            if (!StringUtils.hasText(email)) {
                email = resolveEmailFromProviders(user);
            }

            if (!StringUtils.hasText(email) && StringUtils.hasText(clientEmail)) {
                email = verifyClientEmail(apiKey, clientEmail, uid);
            }

            if (!StringUtils.hasText(email)) {
                log.warn("Firebase lookup missing email for uid={}", uid);
                throw new ValidationException(
                        "Firebase account did not include an email or phone number.");
            }

            return FirebaseUserInfo.builder()
                    .firebaseUid(uid)
                    .authProvider(AuthProvider.GOOGLE)
                    .email(email.toLowerCase())
                    .name(StringUtils.hasText(name) ? name : email)
                    .profilePicture(picture)
                    .emailVerified(emailVerified)
                    .phoneVerified(false)
                    .build();
        } catch (ValidationException ex) {
            throw ex;
        } catch (RestClientException ex) {
            log.debug("Firebase REST token verification failed: {}", ex.getMessage());
            throw new ValidationException("Invalid or expired Firebase ID token");
        } catch (Exception ex) {
            log.warn("Firebase REST token verification error: {}", ex.getMessage());
            throw new ValidationException("Could not verify Firebase ID token");
        }
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        if (value.isMissingNode() || value.isNull()) {
            return null;
        }
        String text = value.asText();
        return StringUtils.hasText(text) ? text : null;
    }

    /** Read email from linked provider profiles when the top-level user node has none. */
    private String resolveEmailFromProviders(JsonNode user) {
        JsonNode providers = user.path("providerUserInfo");
        if (!providers.isArray()) {
            return null;
        }
        for (JsonNode provider : providers) {
            String providerEmail = textOrNull(provider, "email");
            if (StringUtils.hasText(providerEmail)) {
                return providerEmail;
            }
        }
        return null;
    }

    /**
     * Google ID tokens sometimes omit the email claim. The client supplies email from
     * {@code user.email}; we confirm it belongs to the same Firebase UID via lookup.
     */
    private String verifyClientEmail(String apiKey, String clientEmail, String expectedUid) {
        String normalizedEmail = clientEmail.trim().toLowerCase();
        try {
            String body = restClient.post()
                    .uri(String.format(LOOKUP_URL, apiKey))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("email", List.of(normalizedEmail)))
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(body);
            JsonNode users = root.path("users");
            if (!users.isArray() || users.isEmpty()) {
                throw new ValidationException("Email does not match the signed-in Firebase account.");
            }

            JsonNode user = users.get(0);
            String lookedUpUid = textOrNull(user, "localId");
            if (!StringUtils.hasText(lookedUpUid) || !lookedUpUid.equals(expectedUid)) {
                throw new ValidationException("Email does not match the signed-in Firebase account.");
            }

            String resolvedEmail = textOrNull(user, "email");
            return StringUtils.hasText(resolvedEmail) ? resolvedEmail.toLowerCase() : normalizedEmail;
        } catch (ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Firebase email lookup failed for uid {}: {}", expectedUid, ex.getMessage());
            throw new ValidationException("Could not verify email for this Firebase account.");
        }
    }
}

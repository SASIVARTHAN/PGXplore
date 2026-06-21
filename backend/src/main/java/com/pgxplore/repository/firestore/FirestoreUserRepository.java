package com.pgxplore.repository.firestore;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.pgxplore.model.firestore.FirestoreUser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

/**
 * Persists and retrieves user profiles in Firebase Firestore.
 */
@Slf4j
@Repository
public class FirestoreUserRepository {

    private static final String COLLECTION = "users";

    public boolean isAvailable() {
        try {
            return !com.google.firebase.FirebaseApp.getApps().isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    public Optional<FirestoreUser> findByEmail(String email) {
        if (!isAvailable()) {
            return Optional.empty();
        }
        try {
            Firestore firestore = FirestoreClient.getFirestore();
            var query = firestore.collection(COLLECTION)
                    .whereEqualTo("email", email)
                    .limit(1)
                    .get()
                    .get();
            if (query.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(mapDocument(query.getDocuments().get(0).getId(), query.getDocuments().get(0).getData()));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Firestore lookup interrupted for email {}", email);
            return Optional.empty();
        } catch (ExecutionException e) {
            log.warn("Firestore lookup failed for email {}: {}", email, e.getMessage());
            return Optional.empty();
        }
    }

    public void save(FirestoreUser user) {
        if (!isAvailable() || user == null || user.getId() == null) {
            return;
        }
        try {
            Firestore firestore = FirestoreClient.getFirestore();
            Map<String, Object> data = new HashMap<>();
            data.put("id", user.getId());
            data.put("email", user.getEmail());
            data.put("fullName", user.getFullName());
            data.put("profilePicture", user.getProfilePicture());
            data.put("provider", user.getProvider());
            data.put("providerId", user.getProviderId());
            data.put("phone", user.getPhone());
            data.put("phoneVerified", user.isPhoneVerified());
            data.put("role", user.getRole());
            if (user.getCreatedAt() != null) {
                data.put("createdAt", user.getCreatedAt().toInstant(ZoneOffset.UTC).toString());
            }
            firestore.collection(COLLECTION).document(String.valueOf(user.getId())).set(data).get();
            log.debug("Synced user {} to Firestore", user.getEmail());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Firestore save interrupted for user {}", user.getEmail());
        } catch (ExecutionException e) {
            log.warn("Firestore save failed for user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    private FirestoreUser mapDocument(String docId, Map<String, Object> data) {
        return FirestoreUser.builder()
                .id(data.get("id") != null ? Long.valueOf(String.valueOf(data.get("id"))) : Long.valueOf(docId))
                .email((String) data.get("email"))
                .fullName((String) data.get("fullName"))
                .profilePicture((String) data.get("profilePicture"))
                .provider((String) data.get("provider"))
                .providerId((String) data.get("providerId"))
                .role((String) data.get("role"))
                .build();
    }
}

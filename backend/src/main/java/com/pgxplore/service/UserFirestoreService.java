package com.pgxplore.service;

import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.AuthProvider;
import com.pgxplore.model.firestore.FirestoreUser;
import com.pgxplore.repository.firestore.FirestoreUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Syncs authenticated users to Firebase Firestore for profile storage and analytics.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserFirestoreService {

    private final FirestoreUserRepository firestoreUserRepository;

    public void syncUser(User user) {
        syncUser(user, user.getProfilePicture());
    }

    public void syncUser(User user, String profilePicture) {
        if (user == null || user.getId() == null) {
            return;
        }
        if (profilePicture != null && !profilePicture.isBlank()) {
            user.setProfilePicture(profilePicture);
        }
        FirestoreUser doc = FirestoreUser.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getName())
                .profilePicture(user.getProfilePicture())
                .provider(mapProvider(user.getAuthProvider()))
                .providerId(resolveProviderId(user))
                .phone(user.getPhone())
                .phoneVerified(user.isPhoneVerified())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .createdAt(user.getCreatedAt())
                .build();
        firestoreUserRepository.save(doc);
    }

    private String mapProvider(AuthProvider provider) {
        return switch (provider) {
            case GOOGLE -> "GOOGLE";
            case PHONE -> "PHONE";
            case LOCAL -> "LOCAL";
        };
    }

    private String resolveProviderId(User user) {
        if (user.getAuthProvider() == AuthProvider.PHONE) {
            return user.getFirebaseUid();
        }
        return user.getGoogleId();
    }
}

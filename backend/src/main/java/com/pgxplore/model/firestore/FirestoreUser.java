package com.pgxplore.model.firestore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * User document stored in Firestore collection {@code users}.
 * Synced from MySQL on register, login, and Google OAuth.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirestoreUser {
    private Long id;
    private String email;
    private String fullName;
    private String profilePicture;
    /** LOCAL, GOOGLE, or PHONE */
    private String provider;
    /** Google subject ID or Firebase UID */
    private String providerId;
    private String phone;
    private boolean phoneVerified;
    private String role;
    private LocalDateTime createdAt;
}

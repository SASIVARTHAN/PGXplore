package com.pgxplore.security.firebase;

import com.pgxplore.model.enums.AuthProvider;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class FirebaseUserInfo {
    String firebaseUid;
    AuthProvider authProvider;
    String email;
    String phone;
    String name;
    String profilePicture;
    boolean emailVerified;
    boolean phoneVerified;
}

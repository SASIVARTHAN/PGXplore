package com.pgxplore.security.google;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class GoogleUserInfo {
    String googleId;
    String email;
    String name;
    String profilePicture;
    boolean emailVerified;
}

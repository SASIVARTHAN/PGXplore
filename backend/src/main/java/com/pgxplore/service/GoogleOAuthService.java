package com.pgxplore.service;

import com.pgxplore.dto.request.GoogleLoginRequest;
import com.pgxplore.dto.response.GoogleLoginResponse;
import com.pgxplore.model.entity.User;

/**
 * Handles Google OAuth2 ID token verification, user provisioning, and JWT issuance.
 */
public interface GoogleOAuthService {

    /**
     * Verifies the Google ID token, creates or loads the user, syncs to Firestore, and returns JWT.
     */
    GoogleLoginResponse authenticate(GoogleLoginRequest request);

    GoogleLoginResponse authenticateUser(User user);
}

package com.pgxplore.service;

import com.pgxplore.dto.request.UpdateProfileRequest;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.dto.response.UserResponse;
import com.pgxplore.dto.response.UserSummaryResponse;
import com.pgxplore.model.entity.User;
import com.pgxplore.security.firebase.FirebaseUserInfo;
import com.pgxplore.security.google.GoogleUserInfo;

import java.util.List;

public interface UserService {

    /**
     * Finds an existing user by Google ID or email, or auto-registers a new Google user.
     */
    User findOrCreateGoogleUser(GoogleUserInfo googleUser);

    /**
     * Finds an existing user by Firebase UID, phone, or email, or auto-registers from Firebase auth.
     */
    User findOrCreateFirebaseUser(FirebaseUserInfo firebaseUser);

    UserResponse getProfile(Long userId);

    UserSummaryResponse getSummary(Long userId);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);

    List<PgListingResponse> getFavorites(Long userId);

    void addFavorite(Long userId, Long pgId);

    void removeFavorite(Long userId, Long pgId);
}

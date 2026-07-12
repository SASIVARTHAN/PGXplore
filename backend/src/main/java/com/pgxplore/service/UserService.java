package com.pgxplore.service;

import com.pgxplore.dto.request.UpdateProfileRequest;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.dto.response.UserResponse;
import com.pgxplore.dto.response.UserSummaryResponse;

import java.util.List;

public interface UserService {

    UserResponse getProfile(Long userId);

    UserSummaryResponse getSummary(Long userId);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);

    List<PgListingResponse> getFavorites(Long userId);

    void addFavorite(Long userId, Long pgId);

    void removeFavorite(Long userId, Long pgId);
}

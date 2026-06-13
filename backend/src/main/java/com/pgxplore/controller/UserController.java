package com.pgxplore.controller;

import com.pgxplore.dto.request.UpdateProfileRequest;
import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.dto.response.UserResponse;
import com.pgxplore.dto.response.UserSummaryResponse;
import com.pgxplore.service.UserService;
import com.pgxplore.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and favorites")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ApiResponse<UserResponse> getProfile() {
        return ApiResponse.success(userService.getProfile(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/me/summary")
    @Operation(summary = "Get current user profile with saved PGs and activity counts")
    public ApiResponse<UserSummaryResponse> getSummary() {
        return ApiResponse.success(userService.getSummary(SecurityUtils.getCurrentUserId()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ApiResponse<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(
                "Profile updated",
                userService.updateProfile(SecurityUtils.getCurrentUserId(), request));
    }

    @GetMapping("/me/favorites")
    @Operation(summary = "Get current user favorites")
    public ApiResponse<List<PgListingResponse>> getFavorites() {
        return ApiResponse.success(userService.getFavorites(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/me/favorites/{pgId}")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add PG to favorites")
    public ApiResponse<Void> addFavorite(@PathVariable Long pgId) {
        userService.addFavorite(SecurityUtils.getCurrentUserId(), pgId);
        return ApiResponse.success("Added to favorites", null);
    }

    @DeleteMapping("/me/favorites/{pgId}")
    @Operation(summary = "Remove PG from favorites")
    public ApiResponse<Void> removeFavorite(@PathVariable Long pgId) {
        userService.removeFavorite(SecurityUtils.getCurrentUserId(), pgId);
        return ApiResponse.success("Removed from favorites", null);
    }
}

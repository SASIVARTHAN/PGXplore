package com.pgxplore.controller;

import com.pgxplore.dto.request.ReviewRequest;
import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.ReviewResponse;
import com.pgxplore.service.ReviewService;
import com.pgxplore.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "PG review management")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a review")
    public ApiResponse<ReviewResponse> create(@Valid @RequestBody ReviewRequest request) {
        return ApiResponse.success(
                "Review created",
                reviewService.create(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update a review")
    public ApiResponse<ReviewResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.success(
                "Review updated",
                reviewService.update(id, SecurityUtils.getCurrentUserId(), request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete a review")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        reviewService.delete(id, SecurityUtils.getCurrentUserId());
        return ApiResponse.success("Review deleted", null);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get review by ID")
    public ApiResponse<ReviewResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(reviewService.getById(id));
    }

    @GetMapping("/pg/{pgId}")
    @Operation(summary = "Get reviews for a PG listing")
    public ApiResponse<PageResponse<ReviewResponse>> getByPgId(
            @PathVariable Long pgId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(reviewService.getByPgId(pgId, page, size));
    }
}

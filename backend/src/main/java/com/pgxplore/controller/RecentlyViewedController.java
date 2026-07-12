package com.pgxplore.controller;

import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.service.RecentlyViewedService;
import com.pgxplore.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recently-viewed")
@RequiredArgsConstructor
@Tag(name = "Recently Viewed", description = "Recently viewed PG listings")
public class RecentlyViewedController {

    private final RecentlyViewedService recentlyViewedService;

    @PostMapping("/{pgId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Record a PG listing view")
    public ApiResponse<Void> recordView(@PathVariable Long pgId) {
        recentlyViewedService.recordView(SecurityUtils.getCurrentUserId(), pgId);
        return ApiResponse.success("View recorded", null);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get recently viewed listings")
    public ApiResponse<List<PgListingResponse>> getRecentlyViewed() {
        return ApiResponse.success(recentlyViewedService.getRecentlyViewed(SecurityUtils.getCurrentUserId()));
    }
}

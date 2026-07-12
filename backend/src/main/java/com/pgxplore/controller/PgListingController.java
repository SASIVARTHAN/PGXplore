package com.pgxplore.controller;

import com.pgxplore.dto.request.PgListingRequest;
import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.service.PgListingService;
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

import java.util.List;

@RestController
@RequestMapping("/api/pg")
@RequiredArgsConstructor
@Tag(name = "PG Listings", description = "PG listing CRUD operations")
public class PgListingController {

    private final PgListingService pgListingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('PG_OWNER', 'ADMIN')")
    @Operation(summary = "Create a new PG listing")
    public ApiResponse<PgListingResponse> create(@Valid @RequestBody PgListingRequest request) {
        return ApiResponse.success(
                "Listing created",
                pgListingService.create(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PG_OWNER', 'ADMIN')")
    @Operation(summary = "Update a PG listing")
    public ApiResponse<PgListingResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody PgListingRequest request) {
        return ApiResponse.success(
                "Listing updated",
                pgListingService.update(id, SecurityUtils.getCurrentUserId(), request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a PG listing (admin only)")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        pgListingService.delete(id, SecurityUtils.getCurrentUserId());
        return ApiResponse.success("Listing deleted", null);
    }

    @GetMapping("/all")
    @Operation(summary = "List approved PG listings (paginated, public)")
    public ApiResponse<PageResponse<PgListingResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ApiResponse.success(pgListingService.getAll(page, size, sortBy, sortDir));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all PG listings for admin (includes pending)")
    public ApiResponse<PageResponse<PgListingResponse>> getAllForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ApiResponse.success(pgListingService.getAllForAdmin(page, size, sortBy, sortDir));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List PG listings awaiting admin approval")
    public ApiResponse<List<PgListingResponse>> getPendingListings() {
        return ApiResponse.success(pgListingService.getPendingListings());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve a pending PG listing")
    public ApiResponse<PgListingResponse> approve(@PathVariable Long id) {
        return ApiResponse.success(
                "Listing approved",
                pgListingService.approveListing(id, SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject a pending PG listing")
    public ApiResponse<PgListingResponse> reject(@PathVariable Long id) {
        return ApiResponse.success(
                "Listing rejected",
                pgListingService.rejectListing(id, SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get PG listing by ID")
    public ApiResponse<PgListingResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(pgListingService.getById(id));
    }

    @GetMapping("/owner/me")
    @PreAuthorize("hasAnyRole('PG_OWNER', 'ADMIN')")
    @Operation(summary = "Get current owner's listings")
    public ApiResponse<List<PgListingResponse>> getMyListings() {
        return ApiResponse.success(pgListingService.getByOwner(SecurityUtils.getCurrentUserId()));
    }
}

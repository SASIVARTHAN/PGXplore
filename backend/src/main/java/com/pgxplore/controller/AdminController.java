package com.pgxplore.controller;

import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.OwnerApprovalResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.dto.response.UserSummaryResponse;
import com.pgxplore.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin dashboard and management")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics")
    public ApiResponse<Map<String, Long>> getStats() {
        return ApiResponse.success(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ApiResponse<List<UserSummaryResponse>> getAllUsers() {
        return ApiResponse.success(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ApiResponse.success("User deleted", null);
    }

    @GetMapping("/listings")
    @Operation(summary = "Get all PG listings")
    public ApiResponse<List<PgListingResponse>> getAllListings() {
        return ApiResponse.success(adminService.getAllListings());
    }

    @DeleteMapping("/listings/{id}")
    @Operation(summary = "Delete a PG listing")
    public ApiResponse<Void> deleteListing(@PathVariable Long id) {
        adminService.deleteListing(id);
        return ApiResponse.success("Listing deleted", null);
    }

    @GetMapping("/owner-approvals")
    @Operation(summary = "List PG owner registration approvals")
    public ApiResponse<List<OwnerApprovalResponse>> getOwnerApprovals() {
        return ApiResponse.success(adminService.getOwnerApprovals());
    }

    @PostMapping("/owner-approvals/{id}/approve")
    @Operation(summary = "Approve a pending PG owner registration")
    public ApiResponse<OwnerApprovalResponse> approveOwner(@PathVariable Long id) {
        return ApiResponse.success("Owner approved", adminService.approveOwner(id));
    }

    @PostMapping("/owner-approvals/{id}/reject")
    @Operation(summary = "Reject a pending PG owner registration")
    public ApiResponse<OwnerApprovalResponse> rejectOwner(@PathVariable Long id) {
        return ApiResponse.success("Owner rejected", adminService.rejectOwner(id));
    }
}

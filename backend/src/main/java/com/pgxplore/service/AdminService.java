package com.pgxplore.service;

import com.pgxplore.dto.response.OwnerApprovalResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.dto.response.UserSummaryResponse;

import java.util.List;
import java.util.Map;

public interface AdminService {

    List<UserSummaryResponse> getAllUsers();

    void deleteUser(Long userId);

    List<PgListingResponse> getAllListings();

    void deleteListing(Long listingId);

    Map<String, Long> getDashboardStats();

    List<OwnerApprovalResponse> getOwnerApprovals();

    OwnerApprovalResponse approveOwner(Long ownerId);

    OwnerApprovalResponse rejectOwner(Long ownerId);
}

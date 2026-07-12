package com.pgxplore.service.impl;

import com.pgxplore.dto.response.OwnerApprovalResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.dto.response.UserSummaryResponse;
import com.pgxplore.exception.ResourceNotFoundException;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.mapper.PgListingMapper;
import com.pgxplore.mapper.UserMapper;
import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.OwnerApprovalStatus;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.FavoriteRepository;
import com.pgxplore.repository.InquiryRepository;
import com.pgxplore.repository.PgListingRepository;
import com.pgxplore.repository.RecentlyViewedRepository;
import com.pgxplore.repository.ReviewRepository;
import com.pgxplore.repository.UserRepository;
import com.pgxplore.service.AdminService;
import com.pgxplore.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PgListingRepository pgListingRepository;
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;
    private final FavoriteRepository favoriteRepository;
    private final RecentlyViewedRepository recentlyViewedRepository;
    private final UserMapper userMapper;
    private final PgListingMapper pgListingMapper;

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserSummary)
                .toList();
    }

    private UserSummaryResponse toUserSummary(User user) {
        Long userId = user.getId();
        return UserSummaryResponse.builder()
                .id(userId)
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .verified(user.isVerified())
                .createdAt(user.getCreatedAt())
                .savedPgCount(favoriteRepository.countByUserId(userId))
                .reviewCount(reviewRepository.countByUserId(userId))
                .recentlyViewedCount(recentlyViewedRepository.countByUserId(userId))
                .build();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (userId.equals(SecurityUtils.getCurrentUserId())) {
            throw new ValidationException("Cannot delete your own account");
        }

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new ValidationException("Cannot delete admin users");
        }

        userRepository.deleteById(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PgListingResponse> getAllListings() {
        return pgListingRepository.findAll().stream()
                .map(listing -> {
                    listing.getImages().size();
                    return pgListingMapper.toResponse(listing);
                })
                .toList();
    }

    @Override
    @Transactional
    public void deleteListing(Long listingId) {
        if (!pgListingRepository.existsById(listingId)) {
            throw new ResourceNotFoundException("PG listing not found");
        }
        pgListingRepository.deleteById(listingId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalListings", pgListingRepository.count());
        stats.put("totalReviews", reviewRepository.count());
        stats.put("totalInquiries", inquiryRepository.count());
        stats.put(
                "pendingOwnerApprovals",
                userRepository.countByRoleAndOwnerApprovalStatus(Role.PG_OWNER, OwnerApprovalStatus.PENDING));
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OwnerApprovalResponse> getOwnerApprovals() {
        return userRepository.findByRoleOrderByCreatedAtDesc(Role.PG_OWNER).stream()
                .map(this::toOwnerApprovalResponse)
                .toList();
    }

    @Override
    @Transactional
    public OwnerApprovalResponse approveOwner(Long ownerId) {
        User owner = getOwnerForApprovalAction(ownerId);
        owner.setOwnerApprovalStatus(OwnerApprovalStatus.APPROVED);
        owner.setVerified(true);
        return toOwnerApprovalResponse(userRepository.save(owner));
    }

    @Override
    @Transactional
    public OwnerApprovalResponse rejectOwner(Long ownerId) {
        User owner = getOwnerForApprovalAction(ownerId);
        owner.setOwnerApprovalStatus(OwnerApprovalStatus.REJECTED);
        return toOwnerApprovalResponse(userRepository.save(owner));
    }

    private User getOwnerForApprovalAction(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        if (owner.getRole() != Role.PG_OWNER) {
            throw new ValidationException("Only PG owner accounts can be approved or rejected");
        }
        return owner;
    }

    private OwnerApprovalResponse toOwnerApprovalResponse(User user) {
        OwnerApprovalStatus status = user.getOwnerApprovalStatus() != null
                ? user.getOwnerApprovalStatus()
                : OwnerApprovalStatus.PENDING;
        return OwnerApprovalResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .pgName(user.getOwnerPgName())
                .address(user.getOwnerAddress())
                .status(status)
                .registrationDate(user.getCreatedAt())
                .verificationDocuments(user.getOwnerVerificationDocs() != null
                        ? user.getOwnerVerificationDocs()
                        : Collections.emptyList())
                .build();
    }
}

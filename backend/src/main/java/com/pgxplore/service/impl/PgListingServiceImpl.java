package com.pgxplore.service.impl;

import com.pgxplore.dto.request.PgListingRequest;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.exception.ResourceNotFoundException;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.mapper.PgListingMapper;
import com.pgxplore.model.entity.PgImage;
import com.pgxplore.model.entity.PgListing;
import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.PgListingRepository;
import com.pgxplore.repository.UserRepository;
import com.pgxplore.service.PgListingService;
import com.pgxplore.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PgListingServiceImpl implements PgListingService {

    private static final String STATUS_APPROVED = "approved";
    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_REJECTED = "rejected";

    private final PgListingRepository pgListingRepository;
    private final UserRepository userRepository;
    private final PgListingMapper pgListingMapper;

    @Override
    @Transactional
    public PgListingResponse create(Long ownerId, PgListingRequest request) {
        validateAmenities(request);
        applyAvailabilityDefaults(request);
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        Role role = SecurityUtils.getCurrentUser().getRole();
        PgListing listing = pgListingMapper.toEntity(request);
        listing.setOwner(owner);
        listing.setListingStatus(role == Role.ADMIN ? STATUS_APPROVED : STATUS_PENDING);
        syncImages(listing, request.getImageUrls());
        listing = pgListingRepository.save(listing);
        return toResponse(listing);
    }

    @Override
    @Transactional
    public PgListingResponse update(Long listingId, Long userId, PgListingRequest request) {
        validateAmenities(request);
        applyAvailabilityDefaults(request);
        PgListing listing = findListing(listingId);
        verifyOwnerOrAdmin(listing, userId);

        Role role = SecurityUtils.getCurrentUser().getRole();
        pgListingMapper.updateEntity(listing, request);
        if (role == Role.PG_OWNER) {
            listing.setListingStatus(STATUS_PENDING);
        }
        if (request.getImageUrls() != null) {
            syncImages(listing, request.getImageUrls());
        }
        return toResponse(pgListingRepository.save(listing));
    }

    @Override
    @Transactional
    public void delete(Long listingId, Long userId) {
        Role role = SecurityUtils.getCurrentUser().getRole();
        if (role != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can delete listings directly");
        }
        PgListing listing = findListing(listingId);
        pgListingRepository.delete(listing);
    }

    @Override
    @Transactional(readOnly = true)
    public PgListingResponse getById(Long listingId) {
        PgListing listing = findListing(listingId);
        verifyListingVisible(listing);
        return toResponse(listing);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PgListingResponse> getAll(int page, int size, String sortBy, String sortDir) {
        Sort sort = buildSort(sortBy, sortDir);
        var result = pgListingRepository.findByListingStatus(STATUS_APPROVED, PageRequest.of(page, size, sort));
        return PageResponse.from(result.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PgListingResponse> getAllForAdmin(int page, int size, String sortBy, String sortDir) {
        verifyAdmin();
        Sort sort = buildSort(sortBy, sortDir);
        var result = pgListingRepository.findAll(PageRequest.of(page, size, sort));
        return PageResponse.from(result.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PgListingResponse> getByOwner(Long ownerId) {
        return pgListingRepository.findByOwnerId(ownerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PgListingResponse> getPendingListings() {
        verifyAdmin();
        return pgListingRepository.findByListingStatus(STATUS_PENDING).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public PgListingResponse approveListing(Long listingId, Long adminUserId) {
        verifyAdmin();
        PgListing listing = findListing(listingId);
        if (!STATUS_PENDING.equals(listing.getListingStatus())) {
            throw new ValidationException("Only pending listings can be approved");
        }
        listing.setListingStatus(STATUS_APPROVED);
        return toResponse(pgListingRepository.save(listing));
    }

    @Override
    @Transactional
    public PgListingResponse rejectListing(Long listingId, Long adminUserId) {
        verifyAdmin();
        PgListing listing = findListing(listingId);
        if (!STATUS_PENDING.equals(listing.getListingStatus())) {
            throw new ValidationException("Only pending listings can be rejected");
        }
        listing.setListingStatus(STATUS_REJECTED);
        return toResponse(pgListingRepository.save(listing));
    }

    private PgListing findListing(Long listingId) {
        return pgListingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found"));
    }

    private void verifyOwnerOrAdmin(PgListing listing, Long userId) {
        Role role = SecurityUtils.getCurrentUser().getRole();
        if (role == Role.ADMIN) {
            return;
        }
        if (!listing.getOwner().getId().equals(userId)) {
            throw new AccessDeniedException("You are not the owner of this listing");
        }
    }

    private void verifyAdmin() {
        if (SecurityUtils.getCurrentUser().getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Admin access required");
        }
    }

    private void verifyListingVisible(PgListing listing) {
        if (STATUS_APPROVED.equals(listing.getListingStatus())) {
            return;
        }
        var principal = SecurityUtils.getCurrentUserOptional();
        if (principal.isEmpty()) {
            throw new ResourceNotFoundException("PG listing not found");
        }
        var user = principal.get();
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        if (listing.getOwner().getId().equals(user.getId())) {
            return;
        }
        throw new ResourceNotFoundException("PG listing not found");
    }

    private Sort buildSort(String sortBy, String sortDir) {
        return Sort.by("desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "createdAt");
    }

    private void validateAmenities(PgListingRequest request) {
        List<String> amenities = request.getAmenities();
        boolean hasAmenity = amenities != null
                && amenities.stream().anyMatch(a -> a != null && !a.isBlank());
        if (!hasAmenity) {
            throw new ValidationException("Please select at least one amenity.");
        }
    }

    private void applyAvailabilityDefaults(PgListingRequest request) {
        if (request.getAvailabilityStatus() == null || request.getAvailabilityStatus().isBlank()) {
            int beds = request.getAvailableBeds() != null ? request.getAvailableBeds() : 0;
            request.setAvailabilityStatus(beds > 0 ? "active" : "full");
        }
    }

    private void syncImages(PgListing listing, List<String> imageUrls) {
        listing.getImages().clear();
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }
        int index = 0;
        for (String imageUrl : imageUrls) {
            if (imageUrl == null || imageUrl.isBlank()) {
                continue;
            }
            PgImage image = new PgImage();
            image.setPgListing(listing);
            image.setImageUrl(imageUrl.trim());
            image.setPrimary(index == 0);
            listing.getImages().add(image);
            index++;
        }
    }

    private PgListingResponse toResponse(PgListing listing) {
        listing.getImages().size();
        return pgListingMapper.toResponse(listing);
    }
}

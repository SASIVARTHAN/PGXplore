package com.pgxplore.service.impl;

import com.pgxplore.dto.request.PgListingRequest;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.exception.ResourceNotFoundException;
import com.pgxplore.mapper.PgListingMapper;
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

    private final PgListingRepository pgListingRepository;
    private final UserRepository userRepository;
    private final PgListingMapper pgListingMapper;

    @Override
    @Transactional
    public PgListingResponse create(Long ownerId, PgListingRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        PgListing listing = pgListingMapper.toEntity(request);
        listing.setOwner(owner);
        listing = pgListingRepository.save(listing);
        return toResponse(listing);
    }

    @Override
    @Transactional
    public PgListingResponse update(Long listingId, Long userId, PgListingRequest request) {
        PgListing listing = findListing(listingId);
        verifyOwnerOrAdmin(listing, userId);

        pgListingMapper.updateEntity(listing, request);
        return toResponse(pgListingRepository.save(listing));
    }

    @Override
    @Transactional
    public void delete(Long listingId, Long userId) {
        PgListing listing = findListing(listingId);
        verifyOwnerOrAdmin(listing, userId);
        pgListingRepository.delete(listing);
    }

    @Override
    @Transactional(readOnly = true)
    public PgListingResponse getById(Long listingId) {
        return toResponse(findListing(listingId));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PgListingResponse> getAll(int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by("desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "createdAt");
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

    private PgListingResponse toResponse(PgListing listing) {
        listing.getImages().size();
        return pgListingMapper.toResponse(listing);
    }
}

package com.pgxplore.service;

import com.pgxplore.dto.request.PgListingRequest;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;

import java.util.List;

public interface PgListingService {

    PgListingResponse create(Long ownerId, PgListingRequest request);

    PgListingResponse update(Long listingId, Long userId, PgListingRequest request);

    void delete(Long listingId, Long userId);

    PgListingResponse getById(Long listingId);

    PageResponse<PgListingResponse> getAll(int page, int size, String sortBy, String sortDir);

    List<PgListingResponse> getByOwner(Long ownerId);
}

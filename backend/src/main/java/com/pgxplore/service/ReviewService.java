package com.pgxplore.service;

import com.pgxplore.dto.request.ReviewRequest;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.ReviewResponse;

public interface ReviewService {

    ReviewResponse create(Long userId, ReviewRequest request);

    ReviewResponse update(Long reviewId, Long userId, ReviewRequest request);

    void delete(Long reviewId, Long userId);

    ReviewResponse getById(Long reviewId);

    PageResponse<ReviewResponse> getByPgId(Long pgId, int page, int size);
}

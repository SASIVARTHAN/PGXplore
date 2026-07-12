package com.pgxplore.service;

import com.pgxplore.dto.response.PgListingResponse;

import java.util.List;

public interface RecentlyViewedService {

    void recordView(Long userId, Long pgId);

    List<PgListingResponse> getRecentlyViewed(Long userId);
}

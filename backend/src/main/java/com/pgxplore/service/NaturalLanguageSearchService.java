package com.pgxplore.service;

import com.pgxplore.dto.request.NaturalSearchRequest;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;

public interface NaturalLanguageSearchService {

    PageResponse<PgListingResponse> search(NaturalSearchRequest request, int page, int size);
}

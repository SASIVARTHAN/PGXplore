package com.pgxplore.service;

import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.repository.specification.PgListingSpecification.SearchCriteria;

public interface SearchService {

    PageResponse<PgListingResponse> search(SearchCriteria criteria, int page, int size, String sortBy, String sortDir);
}

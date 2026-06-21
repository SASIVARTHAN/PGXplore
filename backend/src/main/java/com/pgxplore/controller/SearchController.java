package com.pgxplore.controller;

import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.model.enums.Gender;
import com.pgxplore.repository.specification.PgListingSpecification.SearchCriteria;
import com.pgxplore.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/pg")
@RequiredArgsConstructor
@Tag(name = "Search", description = "PG listing search with filters")
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/search")
    @Operation(summary = "Search PG listings with dynamic filters")
    public ApiResponse<PageResponse<PgListingResponse>> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) BigDecimal minRent,
            @RequestParam(required = false) BigDecimal maxRent,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) Boolean foodAvailable,
            @RequestParam(required = false) Boolean wifi,
            @RequestParam(required = false) Boolean ac,
            @RequestParam(required = false) Boolean parking,
            @RequestParam(required = false) Boolean laundry,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Integer availableBeds,
            @RequestParam(required = false) Integer availableRooms,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        SearchCriteria criteria = SearchCriteria.builder()
                .city(city)
                .area(area)
                .minRent(minRent)
                .maxRent(maxRent)
                .gender(gender)
                .foodAvailable(foodAvailable)
                .wifi(wifi)
                .ac(ac)
                .parking(parking)
                .laundry(laundry)
                .minRating(minRating)
                .availableBeds(availableBeds)
                .availableRooms(availableRooms)
                .keyword(keyword)
                .build();

        return ApiResponse.success(searchService.search(criteria, page, size, sortBy, sortDir));
    }
}

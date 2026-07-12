package com.pgxplore.controller;

import com.pgxplore.dto.request.NaturalSearchRequest;
import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.service.NaturalLanguageSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Natural Language Search", description = "AI-powered PG search")
public class NaturalSearchController {

    private final NaturalLanguageSearchService naturalLanguageSearchService;

    @PostMapping("/natural")
    @Operation(summary = "Search PG listings using natural language")
    public ApiResponse<PageResponse<PgListingResponse>> search(
            @Valid @RequestBody NaturalSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ApiResponse.success(naturalLanguageSearchService.search(request, page, size));
    }
}

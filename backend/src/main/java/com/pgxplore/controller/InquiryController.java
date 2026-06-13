package com.pgxplore.controller;

import com.pgxplore.dto.request.InquiryRequest;
import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.InquiryResponse;
import com.pgxplore.service.InquiryService;
import com.pgxplore.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
@Tag(name = "Inquiries", description = "PG inquiry management")
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit an inquiry")
    public ApiResponse<InquiryResponse> create(@Valid @RequestBody InquiryRequest request) {
        return ApiResponse.success(
                "Inquiry submitted",
                inquiryService.create(SecurityUtils.getCurrentUserId(), request));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get inquiries submitted by current user")
    public ApiResponse<List<InquiryResponse>> getMyInquiries() {
        return ApiResponse.success(inquiryService.getByUser(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/owner/me")
    @PreAuthorize("hasAnyRole('PG_OWNER', 'ADMIN')")
    @Operation(summary = "Get inquiries for current owner's listings")
    public ApiResponse<List<InquiryResponse>> getOwnerInquiries() {
        return ApiResponse.success(inquiryService.getByOwner(SecurityUtils.getCurrentUserId()));
    }
}

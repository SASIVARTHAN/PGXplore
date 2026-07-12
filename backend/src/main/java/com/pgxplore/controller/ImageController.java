package com.pgxplore.controller;

import com.pgxplore.dto.request.ImageUploadRequest;
import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.PgImageResponse;
import com.pgxplore.service.ImageUploadService;
import com.pgxplore.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Tag(name = "Images", description = "PG image upload and management")
public class ImageController {

    private final ImageUploadService imageUploadService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('PG_OWNER', 'ADMIN')")
    @Operation(summary = "Upload a PG image")
    public ApiResponse<PgImageResponse> upload(
            @RequestPart("file") MultipartFile file,
            @Valid @RequestPart("metadata") ImageUploadRequest request) {
        return ApiResponse.success(
                "Image uploaded",
                imageUploadService.uploadImage(SecurityUtils.getCurrentUserId(), file, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PG_OWNER', 'ADMIN')")
    @Operation(summary = "Delete a PG image")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        imageUploadService.deleteImage(id, SecurityUtils.getCurrentUserId());
        return ApiResponse.success("Image deleted", null);
    }
}

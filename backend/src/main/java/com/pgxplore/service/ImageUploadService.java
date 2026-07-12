package com.pgxplore.service;

import com.pgxplore.dto.request.ImageUploadRequest;
import com.pgxplore.dto.response.PgImageResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ImageUploadService {

    PgImageResponse uploadImage(Long userId, MultipartFile file, ImageUploadRequest request);

    void deleteImage(Long imageId, Long userId);
}

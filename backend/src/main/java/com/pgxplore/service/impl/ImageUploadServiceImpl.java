package com.pgxplore.service.impl;

import com.google.cloud.storage.Blob;
import com.google.firebase.cloud.StorageClient;
import com.pgxplore.dto.request.ImageUploadRequest;
import com.pgxplore.dto.response.PgImageResponse;
import com.pgxplore.exception.ResourceNotFoundException;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.mapper.PgListingMapper;
import com.pgxplore.model.entity.PgImage;
import com.pgxplore.model.entity.PgListing;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.PgImageRepository;
import com.pgxplore.repository.PgListingRepository;
import com.pgxplore.service.ImageUploadService;
import com.pgxplore.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageUploadServiceImpl implements ImageUploadService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final PgListingRepository pgListingRepository;
    private final PgImageRepository pgImageRepository;
    private final PgListingMapper pgListingMapper;

    @Value("${pgxplore.firebase.bucket-name}")
    private String bucketName;

    @Value("${pgxplore.firebase.storage-folder:pg-images}")
    private String storageFolder;

    @Override
    @Transactional
    public PgImageResponse uploadImage(Long userId, MultipartFile file, ImageUploadRequest request) {
        validateFile(file);

        PgListing listing = pgListingRepository.findById(request.getPgId())
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found"));
        verifyOwnerOrAdmin(listing, userId);

        String imageUrl = uploadToFirebase(file, listing.getId());

        if (request.isPrimary()) {
            clearPrimaryFlags(listing.getId());
        }

        PgImage image = PgImage.builder()
                .pgListing(listing)
                .imageUrl(imageUrl)
                .primary(request.isPrimary())
                .build();

        image = pgImageRepository.save(image);
        return pgListingMapper.toImageResponse(image);
    }

    @Override
    @Transactional
    public void deleteImage(Long imageId, Long userId) {
        PgImage image = pgImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));
        verifyOwnerOrAdmin(image.getPgListing(), userId);
        pgImageRepository.delete(image);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Image file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("Image size must not exceed 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new ValidationException("Only JPEG, PNG, and WebP images are allowed");
        }
    }

    private String uploadToFirebase(MultipartFile file, Long pgId) {
        try {
            String extension = resolveExtension(file.getContentType());
            String objectPath = storageFolder + "/" + pgId + "/" + UUID.randomUUID() + extension;

            Blob blob = StorageClient.getInstance()
                    .bucket(bucketName)
                    .create(objectPath, file.getBytes(), file.getContentType());

            return String.format("https://storage.googleapis.com/%s/%s", bucketName, blob.getName());
        } catch (IOException e) {
            log.error("Firebase upload failed", e);
            throw new ValidationException("Failed to upload image: " + e.getMessage());
        } catch (IllegalStateException e) {
            throw new ValidationException("Firebase storage is not configured");
        }
    }

    private String resolveExtension(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }

    private void clearPrimaryFlags(Long pgId) {
        List<PgImage> images = pgImageRepository.findByPgListingId(pgId);
        images.forEach(img -> img.setPrimary(false));
        pgImageRepository.saveAll(images);
    }

    private void verifyOwnerOrAdmin(PgListing listing, Long userId) {
        Role role = SecurityUtils.getCurrentUser().getRole();
        if (role == Role.ADMIN) {
            return;
        }
        if (!listing.getOwner().getId().equals(userId)) {
            throw new AccessDeniedException("You are not the owner of this listing");
        }
    }
}

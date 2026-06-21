package com.pgxplore.service.impl;

import com.pgxplore.dto.request.ReviewRequest;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.ReviewResponse;
import com.pgxplore.exception.DuplicateResourceException;
import com.pgxplore.exception.ResourceNotFoundException;
import com.pgxplore.mapper.ReviewMapper;
import com.pgxplore.model.entity.PgListing;
import com.pgxplore.model.entity.Review;
import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.PgListingRepository;
import com.pgxplore.repository.ReviewRepository;
import com.pgxplore.repository.UserRepository;
import com.pgxplore.service.ReviewService;
import com.pgxplore.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PgListingRepository pgListingRepository;
    private final ReviewMapper reviewMapper;

    @Override
    @Transactional
    public ReviewResponse create(Long userId, ReviewRequest request) {
        if (reviewRepository.existsByUserIdAndPgListingId(userId, request.getPgId())) {
            throw new DuplicateResourceException("You have already reviewed this PG");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        PgListing listing = pgListingRepository.findById(request.getPgId())
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found"));

        Review review = Review.builder()
                .user(user)
                .pgListing(listing)
                .rating(request.getRating())
                .reviewText(request.getReviewText())
                .build();

        review = reviewRepository.save(review);
        recalculateRating(listing);
        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse update(Long reviewId, Long userId, ReviewRequest request) {
        Review review = findReview(reviewId);
        verifyOwnerOrAdmin(review, userId);

        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());
        review = reviewRepository.save(review);

        recalculateRating(review.getPgListing());
        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional
    public void delete(Long reviewId, Long userId) {
        Review review = findReview(reviewId);
        verifyOwnerOrAdmin(review, userId);

        PgListing listing = review.getPgListing();
        reviewRepository.delete(review);
        recalculateRating(listing);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getById(Long reviewId) {
        return reviewMapper.toResponse(findReview(reviewId));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getByPgId(Long pgId, int page, int size) {
        if (!pgListingRepository.existsById(pgId)) {
            throw new ResourceNotFoundException("PG listing not found");
        }

        Page<Review> reviews = reviewRepository.findByPgListingId(pgId, PageRequest.of(page, size));
        return PageResponse.from(reviews.map(reviewMapper::toResponse));
    }

    private Review findReview(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }

    private void verifyOwnerOrAdmin(Review review, Long userId) {
        Role role = SecurityUtils.getCurrentUser().getRole();
        if (role == Role.ADMIN) {
            return;
        }
        if (!review.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only modify your own reviews");
        }
    }

    private void recalculateRating(PgListing listing) {
        Double average = reviewRepository.calculateAverageRating(listing.getId());
        long count = reviewRepository.countByPgListingId(listing.getId());

        listing.setRating(BigDecimal.valueOf(average != null ? average : 0.0)
                .setScale(2, RoundingMode.HALF_UP));
        listing.setReviewsCount((int) count);
        pgListingRepository.save(listing);
    }
}

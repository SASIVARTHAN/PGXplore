package com.pgxplore.service;

import com.pgxplore.dto.request.ReviewRequest;
import com.pgxplore.dto.response.ReviewResponse;
import com.pgxplore.mapper.ReviewMapper;
import com.pgxplore.model.entity.PgListing;
import com.pgxplore.model.entity.Review;
import com.pgxplore.model.entity.User;
import com.pgxplore.repository.PgListingRepository;
import com.pgxplore.repository.ReviewRepository;
import com.pgxplore.repository.UserRepository;
import com.pgxplore.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private PgListingRepository pgListingRepository;
    @Mock private UserRepository userRepository;
    @Mock private ReviewMapper reviewMapper;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    @Test
    void createReview_recalculatesPgRating() {
        ReviewRequest request = new ReviewRequest();
        request.setPgId(1L);
        request.setRating(5);
        request.setReviewText("Excellent PG!");

        User user = User.builder().id(4L).name("Ananya").build();
        PgListing pg = PgListing.builder().id(1L).rating(BigDecimal.ZERO).reviewsCount(0).build();
        Review saved = Review.builder().id(1L).user(user).pgListing(pg).rating(5).reviewText("Excellent PG!").build();

        when(userRepository.findById(4L)).thenReturn(Optional.of(user));
        when(pgListingRepository.findById(1L)).thenReturn(Optional.of(pg));
        when(reviewRepository.existsByUserIdAndPgListingId(4L, 1L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenReturn(saved);
        when(reviewRepository.calculateAverageRating(1L)).thenReturn(5.0);
        when(reviewRepository.countByPgListingId(1L)).thenReturn(1L);
        when(reviewMapper.toResponse(saved)).thenReturn(ReviewResponse.builder().rating(5).build());

        ReviewResponse response = reviewService.create(4L, request);

        assertThat(response.getRating()).isEqualTo(5);
        verify(pgListingRepository).save(any(PgListing.class));
        assertThat(pg.getRating()).isEqualByComparingTo(BigDecimal.valueOf(5.0));
        assertThat(pg.getReviewsCount()).isEqualTo(1);
    }
}

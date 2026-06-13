package com.pgxplore.service.impl;

import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.exception.ResourceNotFoundException;
import com.pgxplore.mapper.PgListingMapper;
import com.pgxplore.model.entity.PgListing;
import com.pgxplore.model.entity.RecentlyViewed;
import com.pgxplore.model.entity.User;
import com.pgxplore.repository.PgListingRepository;
import com.pgxplore.repository.RecentlyViewedRepository;
import com.pgxplore.repository.UserRepository;
import com.pgxplore.service.RecentlyViewedService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecentlyViewedServiceImpl implements RecentlyViewedService {

    private static final int MAX_RECENT_ITEMS = 10;

    private final RecentlyViewedRepository recentlyViewedRepository;
    private final UserRepository userRepository;
    private final PgListingRepository pgListingRepository;
    private final PgListingMapper pgListingMapper;

    @Override
    @Transactional
    public void recordView(Long userId, Long pgId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        PgListing listing = pgListingRepository.findById(pgId)
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found"));

        recentlyViewedRepository.findByUserIdAndPgListingId(userId, pgId)
                .ifPresentOrElse(
                        existing -> {
                            existing.setViewedAt(LocalDateTime.now());
                            recentlyViewedRepository.save(existing);
                        },
                        () -> recentlyViewedRepository.save(RecentlyViewed.builder()
                                .user(user)
                                .pgListing(listing)
                                .viewedAt(LocalDateTime.now())
                                .build())
                );

        trimToMaxItems(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PgListingResponse> getRecentlyViewed(Long userId) {
        return recentlyViewedRepository.findByUserIdOrderByViewedAtDesc(userId).stream()
                .limit(MAX_RECENT_ITEMS)
                .map(RecentlyViewed::getPgListing)
                .map(listing -> {
                    listing.getImages().size();
                    return pgListingMapper.toResponse(listing);
                })
                .toList();
    }

    private void trimToMaxItems(Long userId) {
        List<RecentlyViewed> items = recentlyViewedRepository.findByUserIdOrderByViewedAtDesc(userId);
        if (items.size() > MAX_RECENT_ITEMS) {
            recentlyViewedRepository.deleteAll(items.subList(MAX_RECENT_ITEMS, items.size()));
        }
    }
}

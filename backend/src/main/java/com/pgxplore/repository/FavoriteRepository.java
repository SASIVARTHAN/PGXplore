package com.pgxplore.repository;

import com.pgxplore.model.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserIdOrderBySavedAtDesc(Long userId);
    Optional<Favorite> findByUserIdAndPgListingId(Long userId, Long pgId);
    boolean existsByUserIdAndPgListingId(Long userId, Long pgId);
    void deleteByUserIdAndPgListingId(Long userId, Long pgId);

    long countByUserId(Long userId);
}

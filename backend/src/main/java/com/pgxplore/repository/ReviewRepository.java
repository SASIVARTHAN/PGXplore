package com.pgxplore.repository;

import com.pgxplore.model.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByPgListingId(Long pgId, Pageable pageable);
    Optional<Review> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserIdAndPgListingId(Long userId, Long pgId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.pgListing.id = :pgId")
    Double calculateAverageRating(@Param("pgId") Long pgId);

    long countByPgListingId(Long pgId);

    long countByUserId(Long userId);
}

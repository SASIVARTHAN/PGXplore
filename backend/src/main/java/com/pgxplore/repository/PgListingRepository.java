package com.pgxplore.repository;

import com.pgxplore.model.entity.PgListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface PgListingRepository extends JpaRepository<PgListing, Long>, JpaSpecificationExecutor<PgListing> {
    List<PgListing> findByOwnerId(Long ownerId);

    List<PgListing> findByListingStatus(String listingStatus);

    Page<PgListing> findByListingStatus(String listingStatus, Pageable pageable);
}

package com.pgxplore.repository;

import com.pgxplore.model.entity.PgImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PgImageRepository extends JpaRepository<PgImage, Long> {
    List<PgImage> findByPgListingId(Long pgId);
    long countByPgListingId(Long pgId);
}

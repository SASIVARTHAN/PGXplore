package com.pgxplore.service.impl;

import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.mapper.PgListingMapper;
import com.pgxplore.model.entity.PgListing;
import com.pgxplore.repository.PgListingRepository;
import com.pgxplore.repository.specification.PgListingSpecification;
import com.pgxplore.repository.specification.PgListingSpecification.SearchCriteria;
import com.pgxplore.service.SearchService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final PgListingRepository pgListingRepository;
    private final PgListingMapper pgListingMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PgListingResponse> search(SearchCriteria criteria, int page, int size,
                                                   String sortBy, String sortDir) {
        SearchCriteria filterCriteria = SearchCriteria.builder()
                .city(criteria.getCity())
                .area(criteria.getArea())
                .minRent(criteria.getMinRent())
                .maxRent(criteria.getMaxRent())
                .gender(criteria.getGender())
                .foodAvailable(criteria.getFoodAvailable())
                .wifi(criteria.getWifi())
                .ac(criteria.getAc())
                .parking(criteria.getParking())
                .laundry(criteria.getLaundry())
                .minRating(criteria.getMinRating())
                .availableBeds(criteria.getAvailableBeds())
                .availableRooms(criteria.getAvailableRooms())
                .build();

        Specification<PgListing> spec = PgListingSpecification.fromCriteria(filterCriteria);
        spec = spec.and((root, query, cb) -> cb.equal(root.get("listingStatus"), "approved"));

        if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
            spec = spec.and(keywordSpecification(criteria.getKeyword()));
        }

        Sort sort = Sort.by("desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null && !sortBy.isBlank() ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PgListing> result = pgListingRepository.findAll(spec, pageable);
        Page<PgListingResponse> mapped = result.map(listing -> {
            listing.getImages().size();
            return pgListingMapper.toResponse(listing);
        });

        return PageResponse.from(mapped);
    }

    private Specification<PgListing> keywordSpecification(String keyword) {
        return (root, query, cb) -> {
            String pattern = "%" + keyword.toLowerCase() + "%";
            var likePredicate = cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.get("area")), pattern),
                    cb.like(cb.lower(root.get("city")), pattern)
            );

            List<Long> fullTextIds = findFullTextMatchIds(keyword);
            if (fullTextIds.isEmpty()) {
                return likePredicate;
            }
            return cb.or(likePredicate, root.get("id").in(fullTextIds));
        };
    }

    @SuppressWarnings("unchecked")
    private List<Long> findFullTextMatchIds(String keyword) {
        return entityManager.createNativeQuery(
                        "SELECT id FROM pg_listings WHERE MATCH(name, description, area, city) " +
                                "AGAINST (:keyword IN NATURAL LANGUAGE MODE)", Long.class)
                .setParameter("keyword", keyword)
                .getResultList();
    }
}

package com.pgxplore.repository.specification;

import com.pgxplore.model.entity.PgListing;
import com.pgxplore.model.enums.Gender;
import jakarta.persistence.criteria.Predicate;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class PgListingSpecification {

    private PgListingSpecification() {}

    @Getter
    @Builder
    public static class SearchCriteria {
        private String city;
        private String area;
        private BigDecimal minRent;
        private BigDecimal maxRent;
        private Gender gender;
        private Boolean foodAvailable;
        private Boolean wifi;
        private Boolean ac;
        private Boolean parking;
        private Boolean laundry;
        private BigDecimal minRating;
        private Integer availableBeds;
        private Integer availableRooms;
        private String keyword;
    }

    public static Specification<PgListing> fromCriteria(SearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getCity() != null && !criteria.getCity().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), criteria.getCity().toLowerCase()));
            }
            if (criteria.getArea() != null && !criteria.getArea().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("area")), criteria.getArea().toLowerCase()));
            }
            if (criteria.getMinRent() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rent"), criteria.getMinRent()));
            }
            if (criteria.getMaxRent() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("rent"), criteria.getMaxRent()));
            }
            if (criteria.getGender() != null) {
                predicates.add(cb.equal(root.get("gender"), criteria.getGender()));
            }
            if (criteria.getFoodAvailable() != null) {
                predicates.add(cb.equal(root.get("foodAvailable"), criteria.getFoodAvailable()));
            }
            if (criteria.getMinRating() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), criteria.getMinRating()));
            }
            if (criteria.getAvailableBeds() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("availableBeds"), criteria.getAvailableBeds()));
            }
            if (criteria.getAvailableRooms() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("availableRooms"), criteria.getAvailableRooms()));
            }

            addAmenityPredicate(predicates, cb, root, criteria.getWifi(), "WiFi");
            addAmenityPredicate(predicates, cb, root, criteria.getAc(), "AC");
            addAmenityPredicate(predicates, cb, root, criteria.getParking(), "Parking");
            addAmenityPredicate(predicates, cb, root, criteria.getLaundry(), "Laundry");

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addAmenityPredicate(List<Predicate> predicates,
                                            jakarta.persistence.criteria.CriteriaBuilder cb,
                                            jakarta.persistence.criteria.Root<PgListing> root,
                                            Boolean required,
                                            String amenityName) {
        if (Boolean.TRUE.equals(required)) {
            predicates.add(cb.like(
                    cb.lower(root.get("amenities").as(String.class)),
                    "%\"" + amenityName.toLowerCase() + "\"%"
            ));
        }
    }
}

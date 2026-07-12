package com.pgxplore.mapper;

import com.pgxplore.dto.request.PgListingRequest;
import com.pgxplore.dto.response.PgImageResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.model.entity.PgImage;
import com.pgxplore.model.entity.PgListing;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PgListingMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "reviewsCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "listingStatus", ignore = true)
    PgListing toEntity(PgListingRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "reviewsCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "listingStatus", ignore = true)
    void updateEntity(@MappingTarget PgListing entity, PgListingRequest request);

    @Mapping(source = "owner.id", target = "ownerId")
    @Mapping(target = "ownerName", expression = "java(resolveDisplayOwnerName(entity))")
    PgListingResponse toResponse(PgListing entity);

    default String resolveDisplayOwnerName(PgListing entity) {
        if (entity.getOwnerContactName() != null && !entity.getOwnerContactName().isBlank()) {
            return entity.getOwnerContactName();
        }
        if (entity.getOwner() != null && entity.getOwner().getName() != null) {
            return entity.getOwner().getName();
        }
        return null;
    }

    List<PgListingResponse> toResponseList(List<PgListing> entities);

    @Mapping(source = "primary", target = "primary")
    PgImageResponse toImageResponse(PgImage image);
}

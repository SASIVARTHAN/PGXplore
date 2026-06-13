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
    PgListing toEntity(PgListingRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "reviewsCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget PgListing entity, PgListingRequest request);

    @Mapping(source = "owner.id", target = "ownerId")
    @Mapping(source = "owner.name", target = "ownerName")
    PgListingResponse toResponse(PgListing entity);

    List<PgListingResponse> toResponseList(List<PgListing> entities);

    @Mapping(source = "primary", target = "primary")
    PgImageResponse toImageResponse(PgImage image);
}

package com.pgxplore.dto.response;

import com.pgxplore.model.enums.Gender;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@Schema(description = "PG listing response")
public class PgListingResponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String area;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal rent;
    private BigDecimal deposit;
    private Gender gender;
    private List<String> amenities;
    private Integer availableBeds;
    private Integer availableRooms;
    private boolean foodAvailable;
    private String contactNumber;
    private BigDecimal rating;
    private Integer reviewsCount;
    private Long ownerId;
    private String ownerName;
    private String availabilityStatus;
    private String listingStatus;
    private List<PgImageResponse> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

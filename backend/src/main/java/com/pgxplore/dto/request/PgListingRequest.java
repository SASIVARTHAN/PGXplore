package com.pgxplore.dto.request;

import com.pgxplore.model.enums.Gender;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Schema(description = "Create or update PG listing request")
public class PgListingRequest {

    @NotBlank @Size(max = 255)
    @Schema(example = "Green Nest PG")
    private String name;

    @Size(max = 5000)
    @Schema(example = "Spacious boys PG near Tambaram railway station")
    private String description;

    @Size(max = 500)
    @Schema(example = "12 Station Road")
    private String address;

    @NotBlank @Size(max = 100)
    @Schema(example = "Chennai")
    private String city;

    @NotBlank @Size(max = 100)
    @Schema(example = "Tambaram")
    private String area;

    @Schema(example = "12.9249")
    private BigDecimal latitude;

    @Schema(example = "80.1000")
    private BigDecimal longitude;

    @NotNull @DecimalMin("0.0")
    @Schema(example = "6500.00")
    private BigDecimal rent;

    @NotNull @DecimalMin("0.0")
    @Schema(example = "5000.00")
    private BigDecimal deposit;

    @NotNull
    @Schema(example = "BOYS")
    private Gender gender;

    @NotEmpty(message = "Please select at least one amenity.")
    @Schema(example = "[\"WiFi\",\"AC\",\"Parking\"]")
    private List<String> amenities;

    @Min(0)
    @Schema(example = "4")
    private Integer availableBeds;

    @Min(0)
    @Schema(example = "2")
    private Integer availableRooms;

    @Schema(example = "true")
    private boolean foodAvailable;

    @NotBlank(message = "Owner name is required.")
    @Size(max = 100)
    @Schema(example = "Rajesh Kumar")
    private String ownerContactName;

    @NotBlank(message = "Owner phone number is required.")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
    @Schema(example = "9876543210")
    private String contactNumber;

    @Pattern(regexp = "^(active|limited|full|inactive)$", message = "Invalid availability status")
    @Schema(example = "active")
    private String availabilityStatus;

    @Schema(description = "Ordered image URLs; first image is used as cover")
    private List<String> imageUrls;
}

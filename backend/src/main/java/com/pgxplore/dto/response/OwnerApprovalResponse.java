package com.pgxplore.dto.response;

import com.pgxplore.model.enums.OwnerApprovalStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@Schema(description = "PG owner registration awaiting or after admin approval")
public class OwnerApprovalResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String pgName;
    private String address;
    private OwnerApprovalStatus status;
    private LocalDateTime registrationDate;
    private List<String> verificationDocuments;
}

package com.pgxplore.dto.response;

import com.pgxplore.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "User profile with activity counts")
public class UserSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private boolean verified;
    private LocalDateTime createdAt;
    private long savedPgCount;
    private long reviewCount;
    private long recentlyViewedCount;
}

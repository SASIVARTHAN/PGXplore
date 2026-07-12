package com.pgxplore.model.entity;

import com.pgxplore.model.enums.AuthProvider;
import com.pgxplore.model.enums.OwnerApprovalStatus;
import com.pgxplore.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "firebase_uid", unique = true)
    private String firebaseUid;

    @Column(name = "cognito_sub", unique = true)
    private String cognitoSub;

    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 20, columnDefinition = "varchar(20)")
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(length = 20)
    private String phone;

    @Column(name = "phone_verified", nullable = false)
    @Builder.Default
    private boolean phoneVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20)")
    private Role role;

    @Column(name = "is_verified", nullable = false)
    private boolean verified;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_approval_status", length = 20, columnDefinition = "varchar(20)")
    private OwnerApprovalStatus ownerApprovalStatus;

    @Column(name = "owner_pg_name", length = 255)
    private String ownerPgName;

    @Column(name = "owner_address", length = 500)
    private String ownerAddress;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "owner_verification_docs", columnDefinition = "json")
    @Builder.Default
    private List<String> ownerVerificationDocs = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

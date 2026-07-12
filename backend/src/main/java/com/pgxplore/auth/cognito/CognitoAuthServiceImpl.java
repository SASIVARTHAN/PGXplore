package com.pgxplore.auth.cognito;

import com.pgxplore.dto.request.CognitoLoginRequest;
import com.pgxplore.dto.response.AuthResponse;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.model.entity.RefreshToken;
import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.OwnerApprovalStatus;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.RefreshTokenRepository;
import com.pgxplore.security.jwt.JwtProperties;
import com.pgxplore.security.jwt.JwtService;
import com.pgxplore.service.UserFirestoreService;
import com.pgxplore.service.impl.AuthServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "pgxplore.cognito.user-pool-id")
public class CognitoAuthServiceImpl implements CognitoAuthService {

    private static final String OWNER_PORTAL_MISMATCH_MESSAGE =
            "This phone number is not registered as a PG Owner account.";

    private static final String USER_PORTAL_OWNER_MESSAGE =
            "PG Owner accounts must sign in from the PG Owner login option.";

    private final CognitoTokenVerifier cognitoTokenVerifier;
    private final CognitoUserService cognitoUserService;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserFirestoreService userFirestoreService;

    @Override
    @Transactional
    public AuthResponse authenticate(CognitoLoginRequest request) {
        CognitoUserClaims claims = cognitoTokenVerifier.verify(request.getIdToken());
        boolean isNewRegistration = StringUtils.hasText(request.getName()) || request.getRole() != null;
        User user = cognitoUserService.findOrCreateUser(claims, request.getName(), request.getRole());

        userFirestoreService.syncUser(user);

        // New PG Owner registration: return pending response without tokens (matches /register).
        if (isNewRegistration
                && user.getRole() == Role.PG_OWNER
                && user.getOwnerApprovalStatus() != OwnerApprovalStatus.APPROVED) {
            return AuthResponse.builder()
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .role(user.getRole())
                    .ownerApprovalStatus(user.getOwnerApprovalStatus())
                    .build();
        }

        enforcePortal(user, request.getPortal());
        assertOwnerMayLogin(user);

        refreshTokenRepository.deleteByUser(user);
        return buildAuthResponse(user);
    }

    private void enforcePortal(User user, String portal) {
        boolean ownerPortal = "owner".equalsIgnoreCase(trimToNull(portal));
        if (ownerPortal) {
            if (user.getRole() != Role.PG_OWNER) {
                throw new ValidationException(OWNER_PORTAL_MISMATCH_MESSAGE);
            }
            return;
        }
        if (user.getRole() == Role.PG_OWNER) {
            throw new ValidationException(USER_PORTAL_OWNER_MESSAGE);
        }
    }

    private void assertOwnerMayLogin(User user) {
        if (user.getRole() != Role.PG_OWNER) {
            return;
        }
        OwnerApprovalStatus status = user.getOwnerApprovalStatus();
        if (status == OwnerApprovalStatus.REJECTED) {
            throw new ValidationException(AuthServiceImpl.OWNER_REJECTED_LOGIN_MESSAGE);
        }
        if (status != OwnerApprovalStatus.APPROVED) {
            throw new ValidationException(AuthServiceImpl.OWNER_PENDING_LOGIN_MESSAGE);
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken();

        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(refreshTokenValue)
                .expiryDate(LocalDateTime.now().plusDays(jwtProperties.getRefreshTokenExpiryDays()))
                .build());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .token(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirySeconds())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .ownerApprovalStatus(user.getOwnerApprovalStatus())
                .profilePicture(user.getProfilePicture())
                .build();
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}

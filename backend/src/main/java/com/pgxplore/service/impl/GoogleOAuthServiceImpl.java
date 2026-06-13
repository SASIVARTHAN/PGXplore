package com.pgxplore.service.impl;

import com.pgxplore.dto.request.GoogleLoginRequest;
import com.pgxplore.dto.response.GoogleLoginResponse;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.model.entity.RefreshToken;
import com.pgxplore.model.entity.User;
import com.pgxplore.repository.RefreshTokenRepository;
import com.pgxplore.security.google.GoogleTokenVerifier;
import com.pgxplore.security.google.GoogleUserInfo;
import com.pgxplore.security.jwt.JwtProperties;
import com.pgxplore.security.jwt.JwtService;
import com.pgxplore.service.GoogleOAuthService;
import com.pgxplore.service.UserFirestoreService;
import com.pgxplore.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Production Google OAuth2 flow: verify ID token → find/create user → sync Firestore → issue JWT.
 */
@Service
@RequiredArgsConstructor
public class GoogleOAuthServiceImpl implements GoogleOAuthService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserService userService;
    private final UserFirestoreService userFirestoreService;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    @Transactional
    public GoogleLoginResponse authenticate(GoogleLoginRequest request) {
        GoogleUserInfo googleUser = googleTokenVerifier.verify(request.getIdToken());

        if (!googleUser.isEmailVerified()) {
            throw new ValidationException("Google account email must be verified");
        }

        User user = userService.findOrCreateGoogleUser(googleUser);
        userFirestoreService.syncUser(user, googleUser.getProfilePicture());
        refreshTokenRepository.deleteByUser(user);
        return buildResponse(user);
    }

    @Override
    @Transactional
    public GoogleLoginResponse authenticateUser(User user) {
        userFirestoreService.syncUser(user);
        refreshTokenRepository.deleteByUser(user);
        return buildResponse(user);
    }

    private GoogleLoginResponse buildResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken();

        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(refreshTokenValue)
                .expiryDate(LocalDateTime.now().plusDays(jwtProperties.getRefreshTokenExpiryDays()))
                .build());

        return GoogleLoginResponse.builder()
                .token(accessToken)
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirySeconds())
                .email(user.getEmail())
                .role(user.getRole())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .userId(user.getId())
                .build();
    }
}

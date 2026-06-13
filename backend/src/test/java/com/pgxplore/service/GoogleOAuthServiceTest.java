package com.pgxplore.service;

import com.pgxplore.dto.request.GoogleLoginRequest;
import com.pgxplore.dto.response.GoogleLoginResponse;
import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.AuthProvider;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.RefreshTokenRepository;
import com.pgxplore.security.google.GoogleTokenVerifier;
import com.pgxplore.security.google.GoogleUserInfo;
import com.pgxplore.security.jwt.JwtProperties;
import com.pgxplore.security.jwt.JwtService;
import com.pgxplore.service.impl.GoogleOAuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleOAuthServiceTest {

    @Mock private GoogleTokenVerifier googleTokenVerifier;
    @Mock private UserService userService;
    @Mock private UserFirestoreService userFirestoreService;
    @Mock private JwtService jwtService;
    @Mock private JwtProperties jwtProperties;
    @Mock private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private GoogleOAuthServiceImpl googleOAuthService;

    @Test
    void authenticate_createsJwtForGoogleUser() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setIdToken("google-id-token");

        GoogleUserInfo googleUser = GoogleUserInfo.builder()
                .googleId("google-sub-123")
                .email("user@gmail.com")
                .name("Google User")
                .profilePicture("https://lh3.googleusercontent.com/a/photo")
                .emailVerified(true)
                .build();

        User user = User.builder()
                .id(10L)
                .email("user@gmail.com")
                .name("Google User")
                .role(Role.USER)
                .authProvider(AuthProvider.GOOGLE)
                .verified(true)
                .build();

        when(googleTokenVerifier.verify("google-id-token")).thenReturn(googleUser);
        when(userService.findOrCreateGoogleUser(googleUser)).thenReturn(user);
        when(jwtService.generateAccessToken(user)).thenReturn("jwt-token");
        when(jwtService.generateRefreshToken()).thenReturn("refresh-token");
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(86400L);
        when(jwtProperties.getRefreshTokenExpiryDays()).thenReturn(7L);

        GoogleLoginResponse response = googleOAuthService.authenticate(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("user@gmail.com");
        assertThat(response.getRole()).isEqualTo(Role.USER);
        verify(userFirestoreService).syncUser(user, googleUser.getProfilePicture());
    }
}

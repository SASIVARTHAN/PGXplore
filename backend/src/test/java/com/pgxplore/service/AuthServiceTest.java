package com.pgxplore.service;

import com.pgxplore.config.AppProperties;
import com.pgxplore.config.GoogleOAuthProperties;
import com.pgxplore.dto.request.LoginRequest;
import com.pgxplore.dto.request.RegisterRequest;
import com.pgxplore.dto.response.AuthResponse;
import com.pgxplore.exception.DuplicateResourceException;
import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.AuthProvider;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.PasswordResetTokenRepository;
import com.pgxplore.repository.RefreshTokenRepository;
import com.pgxplore.repository.UserRepository;
import com.pgxplore.security.jwt.JwtProperties;
import com.pgxplore.security.jwt.JwtService;
import com.pgxplore.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private JwtProperties jwtProperties;
    @Mock private AppProperties appProperties;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JavaMailSender mailSender;
    @Mock private GoogleOAuthProperties googleOAuthProperties;
    @Mock private GoogleOAuthService googleOAuthService;
    @Mock private UserService userService;
    @Mock private UserFirestoreService userFirestoreService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void register_createsUserAndReturnsTokens() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("Password@123");
        request.setPhone("9876543210");
        request.setRole(Role.USER);

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtService.generateAccessToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken()).thenReturn("refresh-token");
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(86400L);
        when(jwtProperties.getRefreshTokenExpiryDays()).thenReturn(7L);

        AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("access-token");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).save(any(User.class));
        verify(userFirestoreService).syncUser(any(User.class));
    }

    @Test
    void register_throwsWhenEmailExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("exists@example.com");
        request.setRole(Role.USER);

        when(userRepository.existsByEmail("exists@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void login_returnsTokensForValidUser() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@pgxplore.com");
        request.setPassword("Password@123");

        User user = User.builder()
                .id(1L).name("Admin").email("admin@pgxplore.com")
                .password("encoded")
                .authProvider(AuthProvider.LOCAL)
                .role(Role.ADMIN).verified(true).build();

        when(userRepository.findByEmail("admin@pgxplore.com")).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken()).thenReturn("refresh-token");
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(86400L);
        when(jwtProperties.getRefreshTokenExpiryDays()).thenReturn(7L);

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("access-token");
        assertThat(response.getRole()).isEqualTo(Role.ADMIN);
    }
}

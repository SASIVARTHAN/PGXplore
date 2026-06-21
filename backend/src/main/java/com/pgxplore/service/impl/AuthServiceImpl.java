package com.pgxplore.service.impl;

import com.pgxplore.config.AppProperties;
import com.pgxplore.config.FirebaseWebProperties;
import com.pgxplore.config.GoogleOAuthProperties;
import com.pgxplore.dto.request.ForgotPasswordRequest;
import com.pgxplore.dto.request.GoogleAuthRequest;
import com.pgxplore.dto.request.GoogleDevAuthRequest;
import com.pgxplore.dto.request.GoogleLoginRequest;
import com.pgxplore.dto.request.FirebaseLoginRequest;
import com.pgxplore.dto.request.LoginRequest;
import com.pgxplore.dto.request.RefreshTokenRequest;
import com.pgxplore.dto.request.RegisterRequest;
import com.pgxplore.dto.request.ResetPasswordRequest;
import com.pgxplore.dto.response.AuthResponse;
import com.pgxplore.dto.response.FirebaseConfigResponse;
import com.pgxplore.dto.response.GoogleAuthConfigResponse;
import com.pgxplore.dto.response.GoogleLoginResponse;
import com.pgxplore.exception.DuplicateResourceException;
import com.pgxplore.exception.ResourceNotFoundException;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.model.entity.PasswordResetToken;
import com.pgxplore.model.entity.RefreshToken;
import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.AuthProvider;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.PasswordResetTokenRepository;
import com.pgxplore.repository.RefreshTokenRepository;
import com.pgxplore.repository.UserRepository;
import com.pgxplore.security.firebase.FirebaseTokenVerifier;
import com.pgxplore.security.firebase.FirebaseUserInfo;
import com.pgxplore.security.google.GoogleUserInfo;
import com.pgxplore.security.jwt.JwtProperties;
import com.pgxplore.security.jwt.JwtService;
import com.pgxplore.service.AuthService;
import com.pgxplore.service.GoogleOAuthService;
import com.pgxplore.service.UserFirestoreService;
import com.pgxplore.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AppProperties appProperties;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;
    private final GoogleOAuthProperties googleOAuthProperties;
    private final FirebaseWebProperties firebaseWebProperties;
    private final FirebaseTokenVerifier firebaseTokenVerifier;
    private final GoogleOAuthService googleOAuthService;
    private final UserService userService;
    private final UserFirestoreService userFirestoreService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (request.getRole() == Role.ADMIN) {
            throw new ValidationException("Admin registration is not allowed");
        }

        String phone = request.getPhone() != null ? request.getPhone().trim() : null;
        if (phone != null && !phone.isEmpty() && userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Phone number already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(phone)
                .role(request.getRole())
                .authProvider(AuthProvider.LOCAL)
                .verified(false)
                .build();

        user = userRepository.save(user);
        userFirestoreService.syncUser(user);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getAuthProvider() == AuthProvider.GOOGLE && user.getPassword() == null) {
            throw new ValidationException("This account uses Google sign-in. Please continue with Google.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        refreshTokenRepository.deleteByUser(user);
        userFirestoreService.syncUser(user);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public GoogleLoginResponse googleLogin(GoogleLoginRequest request) {
        return googleOAuthService.authenticate(request);
    }

    @Override
    @Transactional
    public AuthResponse googleLoginLegacy(GoogleAuthRequest request) {
        GoogleLoginResponse response = googleOAuthService.authenticate(
                toGoogleLoginRequest(request));
        return toAuthResponse(response);
    }

    @Override
    @Transactional
    public GoogleLoginResponse firebaseLogin(FirebaseLoginRequest request) {
        FirebaseUserInfo userInfo = firebaseTokenVerifier.verify(request.getIdToken());
        User user = userService.findOrCreateFirebaseUser(userInfo);
        return googleOAuthService.authenticateUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public FirebaseConfigResponse getFirebaseConfig() {
        return FirebaseConfigResponse.builder()
                .apiKey(firebaseWebProperties.getApiKey())
                .authDomain(firebaseWebProperties.getAuthDomain())
                .projectId(firebaseWebProperties.getProjectId())
                .appId(firebaseWebProperties.getAppId())
                .messagingSenderId(firebaseWebProperties.getMessagingSenderId())
                .storageBucket(firebaseWebProperties.getStorageBucket())
                .measurementId(firebaseWebProperties.getMeasurementId())
                .enabled(firebaseWebProperties.isConfigured())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GoogleAuthConfigResponse getGoogleAuthConfig() {
        return GoogleAuthConfigResponse.builder()
                .clientId(googleOAuthProperties.getClientId())
                .devMode(googleOAuthProperties.isDevModeEffective())
                .enabled(googleOAuthProperties.isEnabled())
                .realAuth(googleOAuthProperties.isRealAuthEnabled())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse googleDevLogin(GoogleDevAuthRequest request) {
        if (!googleOAuthProperties.isDevModeEffective()) {
            throw new ValidationException("Development Google sign-in is disabled");
        }

        String email = request.getEmail() != null && !request.getEmail().isBlank()
                ? request.getEmail().toLowerCase().trim()
                : "google.demo@pgxplore.local";
        String name = request.getName() != null && !request.getName().isBlank()
                ? request.getName().trim()
                : "Google Demo User";

        GoogleUserInfo googleUser = GoogleUserInfo.builder()
                .googleId("dev-google-" + email)
                .email(email)
                .name(name)
                .profilePicture(null)
                .emailVerified(true)
                .build();

        User user = userService.findOrCreateGoogleUser(googleUser);
        GoogleLoginResponse response = googleOAuthService.authenticateUser(user);
        return toAuthResponse(response);
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ValidationException("Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new ValidationException("Refresh token expired");
        }

        User user = refreshToken.getUser();
        refreshTokenRepository.delete(refreshToken);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiryDate(LocalDateTime.now().plusMinutes(appProperties.getPasswordResetExpiryMinutes()))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(resetToken);

            String resetLink = appProperties.getFrontendUrl() + "/reset-password?token=" + token;
            sendPasswordResetEmail(user.getEmail(), resetLink);
        });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ValidationException("Invalid or expired reset token"));

        if (resetToken.isUsed()) {
            throw new ValidationException("Reset token already used");
        }
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ValidationException("Reset token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        refreshTokenRepository.deleteByUser(user);
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
                .role(user.getRole())
                .profilePicture(user.getProfilePicture())
                .build();
    }

    private GoogleLoginRequest toGoogleLoginRequest(GoogleAuthRequest request) {
        GoogleLoginRequest loginRequest = new GoogleLoginRequest();
        loginRequest.setIdToken(request.getIdToken());
        return loginRequest;
    }

    private AuthResponse toAuthResponse(GoogleLoginResponse response) {
        return AuthResponse.builder()
                .accessToken(response.getAccessToken())
                .token(response.getToken())
                .refreshToken(response.getRefreshToken())
                .tokenType(response.getTokenType())
                .expiresIn(response.getExpiresIn())
                .userId(response.getUserId())
                .name(response.getName())
                .email(response.getEmail())
                .role(response.getRole())
                .profilePicture(response.getProfilePicture())
                .build();
    }

    private void sendPasswordResetEmail(String email, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("PGXplore Password Reset");
            message.setText("Click the link below to reset your password:\n\n" + resetLink
                    + "\n\nThis link expires in " + appProperties.getPasswordResetExpiryMinutes() + " minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", email, e.getMessage());
        }
    }
}

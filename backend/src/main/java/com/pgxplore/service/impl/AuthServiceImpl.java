package com.pgxplore.service.impl;

import com.pgxplore.dto.request.LoginRequest;
import com.pgxplore.dto.request.OtpSendRequest;
import com.pgxplore.dto.request.OtpVerifyLoginRequest;
import com.pgxplore.dto.request.RefreshTokenRequest;
import com.pgxplore.dto.request.RegisterRequest;
import com.pgxplore.dto.response.AuthResponse;
import com.pgxplore.dto.response.OtpSendResponse;
import com.pgxplore.util.PhoneUtils;
import com.pgxplore.exception.DuplicateResourceException;
import com.pgxplore.exception.PortalAccessDeniedException;
import com.pgxplore.exception.ResourceNotFoundException;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.model.entity.RefreshToken;
import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.AuthProvider;
import com.pgxplore.model.enums.OwnerApprovalStatus;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.RefreshTokenRepository;
import com.pgxplore.repository.UserRepository;
import com.pgxplore.security.jwt.JwtProperties;
import com.pgxplore.security.jwt.JwtService;
import com.pgxplore.service.AuthService;
import com.pgxplore.service.OtpService;
import com.pgxplore.service.UserFirestoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    public static final String OWNER_REGISTRATION_SUCCESS_MESSAGE =
            "Your PG Owner account has been created successfully and is awaiting approval from a Privileged Administrator. "
                    + "You will be able to access the Owner Portal once your account has been approved.";

    public static final String OWNER_PENDING_LOGIN_MESSAGE =
            "Your account is currently awaiting approval from a Privileged Administrator. "
                    + "Please wait until your account has been reviewed and approved.";

    public static final String OWNER_REJECTED_LOGIN_MESSAGE =
            "Your account registration has been rejected. Please contact support for further assistance.";

    private static final String OWNER_PORTAL_MISMATCH_MESSAGE =
            "This phone number is not registered as a PG Owner account.";

    private static final String USER_PORTAL_OWNER_MESSAGE =
            "PG Owner accounts must sign in from the PG Owner login option.";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthenticationManager authenticationManager;
    private final UserFirestoreService userFirestoreService;
    private final OtpService otpService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new ValidationException("Admin registration is not allowed");
        }

        String phone = PhoneUtils.normalize(request.getPhone());
        if (userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Phone number already registered");
        }

        String email = PhoneUtils.syntheticEmail(phone);
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Phone number already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(phone)
                .phoneVerified(false)
                .role(request.getRole())
                .authProvider(AuthProvider.LOCAL)
                .verified(false)
                .build();

        if (request.getRole() == Role.PG_OWNER) {
            user.setOwnerApprovalStatus(OwnerApprovalStatus.PENDING);
            user.setOwnerPgName(trimToNull(request.getPgName()));
            user.setOwnerAddress(trimToNull(request.getAddress()));
            user = userRepository.save(user);
            userFirestoreService.syncUser(user);
            return buildPendingOwnerRegistrationResponse(user);
        }

        user = userRepository.save(user);
        userFirestoreService.syncUser(user);

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User doesn't exist"));

        if (user.getRole() == Role.ADMIN) {
            throw new ResourceNotFoundException("User doesn't exist");
        }

        if (user.getPassword() == null) {
            throw new ValidationException("This account uses phone OTP sign-in.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new BadCredentialsException("Wrong Credentials");
        }

        assertOwnerMayLogin(user);

        refreshTokenRepository.deleteByUser(user);
        userFirestoreService.syncUser(user);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse privilegedLogin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Wrong Credentials"));

        if (user.getPassword() == null) {
            throw new BadCredentialsException("Wrong Credentials");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new BadCredentialsException("Wrong Credentials");
        }

        assertOwnerMayLogin(user);

        if (user.getRole() != Role.ADMIN) {
            throw new PortalAccessDeniedException();
        }

        refreshTokenRepository.deleteByUser(user);
        userFirestoreService.syncUser(user);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public OtpSendResponse sendLoginOtp(OtpSendRequest request) {
        String phone = PhoneUtils.normalize(request.getPhone());
        userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("No account found for this phone number"));

        String demoOtp = otpService.sendOtp(phone);
        return OtpSendResponse.builder()
                .demoOtp(demoOtp)
                .message("OTP sent successfully")
                .build();
    }

    @Override
    @Transactional
    public AuthResponse verifyLoginOtp(OtpVerifyLoginRequest request) {
        String phone = PhoneUtils.normalize(request.getPhone());
        otpService.verifyOtp(phone, request.getOtp());

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("No account found for this phone number"));

        boolean ownerPortal = "owner".equalsIgnoreCase(trimToNull(request.getPortal()));
        if (ownerPortal) {
            if (user.getRole() != Role.PG_OWNER) {
                throw new ValidationException(OWNER_PORTAL_MISMATCH_MESSAGE);
            }
        } else {
            if (user.getRole() == Role.ADMIN) {
                throw new ResourceNotFoundException("User doesn't exist");
            }
            if (user.getRole() == Role.PG_OWNER) {
                throw new ValidationException(USER_PORTAL_OWNER_MESSAGE);
            }
        }

        assertOwnerMayLogin(user);

        user.setPhoneVerified(true);
        userRepository.save(user);
        refreshTokenRepository.deleteByUser(user);
        userFirestoreService.syncUser(user);
        return buildAuthResponse(user);
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

    private AuthResponse buildPendingOwnerRegistrationResponse(User user) {
        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .ownerApprovalStatus(user.getOwnerApprovalStatus())
                .build();
    }

    private void assertOwnerMayLogin(User user) {
        if (user.getRole() != Role.PG_OWNER) {
            return;
        }
        OwnerApprovalStatus status = user.getOwnerApprovalStatus();
        if (status == OwnerApprovalStatus.REJECTED) {
            throw new ValidationException(OWNER_REJECTED_LOGIN_MESSAGE);
        }
        if (status != OwnerApprovalStatus.APPROVED) {
            throw new ValidationException(OWNER_PENDING_LOGIN_MESSAGE);
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

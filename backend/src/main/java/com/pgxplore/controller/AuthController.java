package com.pgxplore.controller;

import com.pgxplore.auth.cognito.CognitoAuthService;
import com.pgxplore.config.CognitoProperties;
import com.pgxplore.dto.request.CognitoLoginRequest;
import com.pgxplore.dto.request.LoginRequest;
import com.pgxplore.dto.request.OtpSendRequest;
import com.pgxplore.dto.request.OtpVerifyLoginRequest;
import com.pgxplore.dto.request.RefreshTokenRequest;
import com.pgxplore.dto.request.RegisterRequest;
import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.AuthResponse;
import com.pgxplore.dto.response.CognitoConfigResponse;
import com.pgxplore.dto.response.OtpSendResponse;
import com.pgxplore.exception.ValidationException;
import com.pgxplore.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Phone OTP (Cognito), demo OTP, admin login, and token management")
public class AuthController {

    private final AuthService authService;
    private final CognitoProperties cognitoProperties;
    private final CognitoAuthService cognitoAuthService;

    public AuthController(
            AuthService authService,
            CognitoProperties cognitoProperties,
            @Autowired(required = false) CognitoAuthService cognitoAuthService) {
        this.authService = authService;
        this.cognitoProperties = cognitoProperties;
        this.cognitoAuthService = cognitoAuthService;
    }

    @GetMapping("/cognito/config")
    @Operation(summary = "Get Amazon Cognito configuration for phone OTP on the frontend")
    public ApiResponse<CognitoConfigResponse> getCognitoConfig() {
        return ApiResponse.success(CognitoConfigResponse.builder()
                .enabled(cognitoProperties.isConfigured())
                .region(cognitoProperties.getRegion())
                .userPoolId(cognitoProperties.getUserPoolId())
                .clientId(cognitoProperties.getClientId())
                .build());
    }

    @PostMapping("/cognito")
    @Operation(summary = "Authenticate with Amazon Cognito phone OTP (ID token)")
    public ApiResponse<AuthResponse> cognitoLogin(@Valid @RequestBody CognitoLoginRequest request) {
        if (cognitoAuthService == null) {
            throw new ValidationException("Amazon Cognito is not configured on the server");
        }
        return ApiResponse.success("Phone sign-in successful", cognitoAuthService.authenticate(request));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user (phone/password)")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Registration successful", authService.register(request));
    }

    @PostMapping("/otp/send")
    @Operation(summary = "Send login OTP to a registered phone number")
    public ApiResponse<OtpSendResponse> sendLoginOtp(@Valid @RequestBody OtpSendRequest request) {
        return ApiResponse.success(authService.sendLoginOtp(request));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify OTP and sign in with phone")
    public ApiResponse<AuthResponse> verifyLoginOtp(@Valid @RequestBody OtpVerifyLoginRequest request) {
        AuthResponse response = authService.verifyLoginOtp(request);
        return ApiResponse.success("Login successful", response);
    }

    @PostMapping("/login")
    @Operation(summary = "Legacy login with email and password")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Login successful",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class)))
    })
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.success("Login successful", response);
    }

    @PostMapping("/login/privileged")
    @Operation(summary = "Login for the privileged admin portal (admin accounts only)")
    public ApiResponse<AuthResponse> privilegedLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.privilegedLogin(request);
        return ApiResponse.success("Login successful", response);
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success("Token refreshed", authService.refresh(request));
    }
}

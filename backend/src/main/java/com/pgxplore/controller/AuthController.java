package com.pgxplore.controller;

import com.pgxplore.dto.request.ForgotPasswordRequest;
import com.pgxplore.dto.request.GoogleAuthRequest;
import com.pgxplore.dto.request.GoogleDevAuthRequest;
import com.pgxplore.dto.request.GoogleLoginRequest;
import com.pgxplore.dto.request.FirebaseLoginRequest;
import com.pgxplore.dto.request.LoginRequest;
import com.pgxplore.dto.request.RefreshTokenRequest;
import com.pgxplore.dto.request.RegisterRequest;
import com.pgxplore.dto.request.ResetPasswordRequest;
import com.pgxplore.dto.response.ApiResponse;
import com.pgxplore.dto.response.AuthResponse;
import com.pgxplore.dto.response.FirebaseConfigResponse;
import com.pgxplore.dto.response.GoogleAuthConfigResponse;
import com.pgxplore.dto.response.GoogleLoginResponse;
import com.pgxplore.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, Google OAuth, and token management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user (email/password)")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Registration successful", authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
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

    @GetMapping("/google/config")
    @Operation(summary = "Get Google Sign-In configuration for the frontend")
    public ApiResponse<GoogleAuthConfigResponse> getGoogleConfig() {
        return ApiResponse.success(authService.getGoogleAuthConfig());
    }

    @PostMapping("/google")
    @Operation(
            summary = "Google OAuth login",
            description = """
                    Authenticate using a Google ID token from Google Identity Services.
                    Verifies the token, auto-registers new users, syncs profile to Firestore, and returns JWT.
                    """)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Google login successful",
                    content = @Content(
                            schema = @Schema(implementation = GoogleLoginResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "success": true,
                                      "data": {
                                        "token": "jwt-token",
                                        "email": "user@gmail.com",
                                        "role": "USER",
                                        "name": "User Name"
                                      }
                                    }
                                    """))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid Google ID token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ApiResponse<GoogleLoginResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ApiResponse.success("Google sign-in successful", authService.googleLogin(request));
    }

    @PostMapping("/google/legacy")
    @Operation(summary = "Google login (legacy AuthResponse format)", hidden = true)
    public ApiResponse<AuthResponse> googleLoginLegacy(@Valid @RequestBody GoogleAuthRequest request) {
        return ApiResponse.success("Google sign-in successful", authService.googleLoginLegacy(request));
    }

    @PostMapping("/google/dev")
    @Operation(summary = "Development-only Google sign-in (no Google Cloud credentials)")
    public ApiResponse<AuthResponse> googleDevLogin(@RequestBody(required = false) GoogleDevAuthRequest request) {
        GoogleDevAuthRequest body = request != null ? request : new GoogleDevAuthRequest();
        return ApiResponse.success("Google dev sign-in successful", authService.googleDevLogin(body));
    }

    @GetMapping("/firebase/config")
    @Operation(summary = "Get Firebase web config for Google sign-in on the frontend")
    public ApiResponse<FirebaseConfigResponse> getFirebaseConfig() {
        return ApiResponse.success(authService.getFirebaseConfig());
    }

    @PostMapping("/firebase")
    @Operation(
            summary = "Firebase login (Google via Firebase Authentication)",
            description = "Verify a Firebase ID token from signInWithPopup, auto-register user, and return JWT.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Firebase login successful",
                    content = @Content(schema = @Schema(implementation = GoogleLoginResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid Firebase token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ApiResponse<GoogleLoginResponse> firebaseLogin(@Valid @RequestBody FirebaseLoginRequest request) {
        return ApiResponse.success("Firebase sign-in successful", authService.firebaseLogin(request));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success("Token refreshed", authService.refresh(request));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset email")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success("If the email exists, a reset link has been sent", null);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Password reset successful", null);
    }
}

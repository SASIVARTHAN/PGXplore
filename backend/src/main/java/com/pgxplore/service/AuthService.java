package com.pgxplore.service;

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

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    GoogleLoginResponse googleLogin(GoogleLoginRequest request);

    /** @deprecated Use {@link #googleLogin(GoogleLoginRequest)} */
    AuthResponse googleLoginLegacy(GoogleAuthRequest request);

    AuthResponse googleDevLogin(GoogleDevAuthRequest request);

    GoogleAuthConfigResponse getGoogleAuthConfig();

    /** Verifies a Firebase ID token (e.g. Google popup sign-in) and issues a JWT. */
    GoogleLoginResponse firebaseLogin(FirebaseLoginRequest request);

    FirebaseConfigResponse getFirebaseConfig();

    AuthResponse refresh(RefreshTokenRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}

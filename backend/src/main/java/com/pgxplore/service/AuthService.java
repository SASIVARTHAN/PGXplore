package com.pgxplore.service;

import com.pgxplore.dto.request.LoginRequest;
import com.pgxplore.dto.request.OtpSendRequest;
import com.pgxplore.dto.request.OtpVerifyLoginRequest;
import com.pgxplore.dto.request.RefreshTokenRequest;
import com.pgxplore.dto.request.RegisterRequest;
import com.pgxplore.dto.response.AuthResponse;
import com.pgxplore.dto.response.OtpSendResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse privilegedLogin(LoginRequest request);

    OtpSendResponse sendLoginOtp(OtpSendRequest request);

    AuthResponse verifyLoginOtp(OtpVerifyLoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);
}

package com.pgxplore.auth.cognito;

import com.pgxplore.dto.request.CognitoLoginRequest;
import com.pgxplore.dto.response.AuthResponse;

public interface CognitoAuthService {

    AuthResponse authenticate(CognitoLoginRequest request);
}

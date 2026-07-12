package com.pgxplore.auth.cognito;

public interface CognitoTokenVerifier {

    CognitoUserClaims verify(String idToken);
}

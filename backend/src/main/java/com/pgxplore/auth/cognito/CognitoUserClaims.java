package com.pgxplore.auth.cognito;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CognitoUserClaims {
    String sub;
    String phoneNumber;
    String name;
    boolean phoneVerified;
}

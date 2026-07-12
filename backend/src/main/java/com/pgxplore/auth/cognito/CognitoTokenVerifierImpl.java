package com.pgxplore.auth.cognito;

import com.pgxplore.config.CognitoProperties;
import com.pgxplore.exception.ValidationException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "pgxplore.cognito.user-pool-id")
public class CognitoTokenVerifierImpl implements CognitoTokenVerifier {

    private final JwtDecoder cognitoJwtDecoder;
    private final CognitoProperties cognitoProperties;

    public CognitoTokenVerifierImpl(
            @Qualifier("cognitoJwtDecoder") JwtDecoder cognitoJwtDecoder,
            CognitoProperties cognitoProperties) {
        this.cognitoJwtDecoder = cognitoJwtDecoder;
        this.cognitoProperties = cognitoProperties;
    }

    @Override
    public CognitoUserClaims verify(String idToken) {
        if (!cognitoProperties.isConfigured()) {
            throw new ValidationException("Amazon Cognito is not configured");
        }
        try {
            Jwt jwt = cognitoJwtDecoder.decode(idToken);
            String phoneNumber = jwt.getClaimAsString("phone_number");
            if (phoneNumber == null || phoneNumber.isBlank()) {
                throw new ValidationException("Cognito token is missing phone_number claim");
            }
            return CognitoUserClaims.builder()
                    .sub(jwt.getSubject())
                    .phoneNumber(phoneNumber)
                    .name(jwt.getClaimAsString("name"))
                    .phoneVerified(Boolean.TRUE.equals(jwt.getClaimAsBoolean("phone_number_verified")))
                    .build();
        } catch (JwtException e) {
            throw new ValidationException("Invalid Cognito token: " + e.getMessage());
        }
    }
}

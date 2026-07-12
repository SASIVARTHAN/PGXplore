package com.pgxplore.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "pgxplore.cognito")
public class CognitoProperties {

    private String region = "ap-southeast-2";
    private String userPoolId = "";
    private String clientId = "";

    public boolean isConfigured() {
        return StringUtils.hasText(userPoolId) && StringUtils.hasText(clientId);
    }

    public String getIssuerUri() {
        return "https://cognito-idp." + region + ".amazonaws.com/" + userPoolId;
    }

    public String getJwkSetUri() {
        return getIssuerUri() + "/.well-known/jwks.json";
    }
}

package com.pgxplore.security.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "pgxplore.jwt")
public class JwtProperties {
    private String secret;
    private long accessTokenExpiryMinutes = 15;
    private long refreshTokenExpiryDays = 7;
}

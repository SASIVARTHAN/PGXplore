package com.pgxplore.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "pgxplore.otp")
public class OtpProperties {

    /** Demo OTP accepted in all environments until SMS is wired up. */
    private String devCode = "123456";

    private int expiryMinutes = 10;
}

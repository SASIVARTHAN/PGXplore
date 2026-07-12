package com.pgxplore.service;

import com.pgxplore.config.OtpProperties;
import com.pgxplore.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpProperties otpProperties;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, OtpEntry> otpByPhone = new ConcurrentHashMap<>();

    public String sendOtp(String phone) {
        String code = generateCode();
        otpByPhone.put(phone, new OtpEntry(code, Instant.now().plusSeconds(otpProperties.getExpiryMinutes() * 60L)));
        log.info("OTP for {}: {} (demo code {} also accepted)", phone, code, otpProperties.getDevCode());
        return otpProperties.getDevCode();
    }

    public void verifyOtp(String phone, String otp) {
        if (otp == null || otp.isBlank()) {
            throw new ValidationException("OTP is required");
        }
        String trimmed = otp.trim();
        if (trimmed.equals(otpProperties.getDevCode())) {
            otpByPhone.remove(phone);
            return;
        }
        OtpEntry entry = otpByPhone.get(phone);
        if (entry == null) {
            throw new ValidationException("Invalid or expired OTP");
        }
        if (entry.expiresAt().isBefore(Instant.now())) {
            otpByPhone.remove(phone);
            throw new ValidationException("Invalid or expired OTP");
        }
        if (!entry.code().equals(trimmed)) {
            throw new ValidationException("Invalid or expired OTP");
        }
        otpByPhone.remove(phone);
    }

    private String generateCode() {
        int value = secureRandom.nextInt(900_000) + 100_000;
        return String.valueOf(value);
    }

    private record OtpEntry(String code, Instant expiresAt) {}
}

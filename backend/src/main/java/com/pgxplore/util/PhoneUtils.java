package com.pgxplore.util;

import com.pgxplore.exception.ValidationException;

public final class PhoneUtils {

    private PhoneUtils() {}

    public static String normalize(String phone) {
        if (phone == null) {
            throw new ValidationException("Phone number is required");
        }
        String digits = phone.replaceAll("\\D", "");
        if (!digits.matches("^[0-9]{10}$")) {
            throw new ValidationException("Phone must be 10 digits");
        }
        return digits;
    }

    public static String syntheticEmail(String phone) {
        return normalize(phone) + "@phone.pgxplore.local";
    }
}

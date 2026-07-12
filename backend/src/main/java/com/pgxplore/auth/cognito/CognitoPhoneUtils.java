package com.pgxplore.auth.cognito;

import org.springframework.util.StringUtils;

public final class CognitoPhoneUtils {

    private CognitoPhoneUtils() {
    }

    /** Converts E.164 (+919876543210) to 10-digit local number for MySQL storage. */
    public static String toLocalDigits(String e164Phone) {
        if (!StringUtils.hasText(e164Phone)) {
            return "";
        }
        String digits = e164Phone.replaceAll("\\D", "");
        if (digits.length() == 12 && digits.startsWith("91")) {
            return digits.substring(2);
        }
        if (digits.length() == 10) {
            return digits;
        }
        return digits;
    }

    public static String toSyntheticEmail(String localDigits) {
        return localDigits + "@phone.pgxplore.local";
    }
}

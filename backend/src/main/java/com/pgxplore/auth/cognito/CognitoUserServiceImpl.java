package com.pgxplore.auth.cognito;

import com.pgxplore.exception.ValidationException;
import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.AuthProvider;
import com.pgxplore.model.enums.OwnerApprovalStatus;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CognitoUserServiceImpl implements CognitoUserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public User findOrCreateUser(CognitoUserClaims claims, String name, Role role) {
        if (!claims.isPhoneVerified()) {
            throw new ValidationException("Phone number must be verified in Cognito");
        }

        String phoneDigits = CognitoPhoneUtils.toLocalDigits(claims.getPhoneNumber());
        if (!StringUtils.hasText(phoneDigits) || phoneDigits.length() != 10) {
            throw new ValidationException("Invalid phone number in Cognito token");
        }

        User user = userRepository.findByCognitoSub(claims.getSub())
                .or(() -> userRepository.findByPhone(phoneDigits))
                .orElse(null);

        if (user == null) {
            Role assignedRole = resolveRole(role);
            String displayName = resolveName(name, claims.getName(), phoneDigits);

            user = User.builder()
                    .name(displayName)
                    .email(CognitoPhoneUtils.toSyntheticEmail(phoneDigits))
                    .phone(phoneDigits)
                    .cognitoSub(claims.getSub())
                    .authProvider(AuthProvider.PHONE)
                    .phoneVerified(true)
                    .verified(true)
                    .role(assignedRole)
                    .build();

            if (assignedRole == Role.PG_OWNER) {
                user.setOwnerApprovalStatus(OwnerApprovalStatus.PENDING);
            }

            return userRepository.save(user);
        }

        user.setCognitoSub(claims.getSub());
        user.setPhone(phoneDigits);
        user.setPhoneVerified(true);
        user.setVerified(true);

        String displayName = resolveName(name, claims.getName(), null);
        if (StringUtils.hasText(displayName) && (!StringUtils.hasText(user.getName()) || user.getName().startsWith("User "))) {
            user.setName(displayName);
        }

        if (user.getAuthProvider() == AuthProvider.LOCAL && user.getPassword() == null) {
            user.setAuthProvider(AuthProvider.PHONE);
        }

        return userRepository.save(user);
    }

    private Role resolveRole(Role role) {
        if (role == null || role == Role.ADMIN) {
            return Role.USER;
        }
        return role;
    }

    private String resolveName(String requestName, String cognitoName, String phoneDigits) {
        if (StringUtils.hasText(requestName)) {
            return requestName.trim();
        }
        if (StringUtils.hasText(cognitoName)) {
            return cognitoName.trim();
        }
        if (StringUtils.hasText(phoneDigits)) {
            return "User " + phoneDigits;
        }
        return "User";
    }
}

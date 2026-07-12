package com.pgxplore.auth.cognito;

import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.Role;

public interface CognitoUserService {

    User findOrCreateUser(CognitoUserClaims claims, String name, Role role);
}

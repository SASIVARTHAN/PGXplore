package com.pgxplore.repository;

import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.OwnerApprovalStatus;
import com.pgxplore.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByCognitoSub(String cognitoSub);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    List<User> findByRole(Role role);
    List<User> findByRoleOrderByCreatedAtDesc(Role role);
    long countByRoleAndOwnerApprovalStatus(Role role, OwnerApprovalStatus status);
}

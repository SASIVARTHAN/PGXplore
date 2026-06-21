package com.pgxplore.service.impl;

import com.pgxplore.dto.request.UpdateProfileRequest;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.dto.response.UserResponse;
import com.pgxplore.dto.response.UserSummaryResponse;
import com.pgxplore.exception.DuplicateResourceException;
import com.pgxplore.exception.ResourceNotFoundException;
import com.pgxplore.mapper.PgListingMapper;
import com.pgxplore.mapper.UserMapper;
import com.pgxplore.model.entity.Favorite;
import com.pgxplore.model.entity.PgListing;
import com.pgxplore.model.entity.User;
import com.pgxplore.model.enums.AuthProvider;
import com.pgxplore.model.enums.Role;
import com.pgxplore.repository.FavoriteRepository;
import com.pgxplore.security.firebase.FirebaseUserInfo;
import com.pgxplore.security.google.GoogleUserInfo;
import com.pgxplore.repository.PgListingRepository;
import com.pgxplore.repository.RecentlyViewedRepository;
import com.pgxplore.repository.ReviewRepository;
import com.pgxplore.repository.UserRepository;
import com.pgxplore.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PgListingRepository pgListingRepository;
    private final FavoriteRepository favoriteRepository;
    private final ReviewRepository reviewRepository;
    private final RecentlyViewedRepository recentlyViewedRepository;
    private final UserMapper userMapper;
    private final PgListingMapper pgListingMapper;

    @Override
    @Transactional
    public User findOrCreateGoogleUser(GoogleUserInfo googleUser) {
        User user = userRepository.findByGoogleId(googleUser.getGoogleId())
                .or(() -> userRepository.findByEmail(googleUser.getEmail()))
                .orElse(null);

        if (user == null) {
            user = User.builder()
                    .name(googleUser.getName())
                    .email(googleUser.getEmail())
                    .googleId(googleUser.getGoogleId())
                    .profilePicture(googleUser.getProfilePicture())
                    .authProvider(AuthProvider.GOOGLE)
                    .role(Role.USER)
                    .verified(true)
                    .build();
            return userRepository.save(user);
        }

        user.setGoogleId(googleUser.getGoogleId());
        user.setVerified(true);
        if (googleUser.getProfilePicture() != null && !googleUser.getProfilePicture().isBlank()) {
            user.setProfilePicture(googleUser.getProfilePicture());
        }
        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(googleUser.getName());
        }
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User findOrCreateFirebaseUser(FirebaseUserInfo firebaseUser) {
        if (firebaseUser.getAuthProvider() == AuthProvider.PHONE) {
            return findOrCreatePhoneUser(firebaseUser);
        }
        return findOrCreateGoogleFirebaseUser(firebaseUser);
    }

    private User findOrCreatePhoneUser(FirebaseUserInfo firebaseUser) {
        String phone = firebaseUser.getPhone();
        User user = userRepository.findByFirebaseUid(firebaseUser.getFirebaseUid())
                .or(() -> userRepository.findByPhone(phone))
                .orElse(null);

        String email = resolvePhoneUserEmail(firebaseUser, phone);

        if (user == null) {
            user = User.builder()
                    .name(firebaseUser.getName())
                    .email(email)
                    .firebaseUid(firebaseUser.getFirebaseUid())
                    .phone(phone)
                    .phoneVerified(true)
                    .authProvider(AuthProvider.PHONE)
                    .role(Role.USER)
                    .verified(true)
                    .build();
            return userRepository.save(user);
        }

        user.setFirebaseUid(firebaseUser.getFirebaseUid());
        user.setPhone(phone);
        user.setPhoneVerified(true);
        user.setVerified(true);
        if (user.getAuthProvider() == AuthProvider.LOCAL && user.getPassword() != null) {
            user.setAuthProvider(AuthProvider.PHONE);
        } else if (user.getAuthProvider() == AuthProvider.LOCAL) {
            user.setAuthProvider(AuthProvider.PHONE);
        }
        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(firebaseUser.getName());
        }
        return userRepository.save(user);
    }

    private User findOrCreateGoogleFirebaseUser(FirebaseUserInfo firebaseUser) {
        User user = userRepository.findByFirebaseUid(firebaseUser.getFirebaseUid())
                .or(() -> userRepository.findByGoogleId(firebaseUser.getFirebaseUid()))
                .or(() -> userRepository.findByEmail(firebaseUser.getEmail()))
                .orElse(null);

        if (user == null) {
            user = User.builder()
                    .name(firebaseUser.getName())
                    .email(firebaseUser.getEmail())
                    .googleId(firebaseUser.getFirebaseUid())
                    .firebaseUid(firebaseUser.getFirebaseUid())
                    .profilePicture(firebaseUser.getProfilePicture())
                    .authProvider(AuthProvider.GOOGLE)
                    .role(Role.USER)
                    .verified(true)
                    .build();
            return userRepository.save(user);
        }

        user.setFirebaseUid(firebaseUser.getFirebaseUid());
        user.setGoogleId(firebaseUser.getFirebaseUid());
        user.setVerified(true);
        if (firebaseUser.getProfilePicture() != null && !firebaseUser.getProfilePicture().isBlank()) {
            user.setProfilePicture(firebaseUser.getProfilePicture());
        }
        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(firebaseUser.getName());
        }
        if (user.getAuthProvider() == AuthProvider.LOCAL) {
            user.setAuthProvider(AuthProvider.GOOGLE);
        }
        return userRepository.save(user);
    }

    private String resolvePhoneUserEmail(FirebaseUserInfo firebaseUser, String phone) {
        if (firebaseUser.getEmail() != null && !firebaseUser.getEmail().isBlank()) {
            return firebaseUser.getEmail();
        }
        return phone + "@phone.pgxplore.local";
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = findUser(userId);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryResponse getSummary(Long userId) {
        User user = findUser(userId);
        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .verified(user.isVerified())
                .createdAt(user.getCreatedAt())
                .savedPgCount(favoriteRepository.countByUserId(userId))
                .reviewCount(reviewRepository.countByUserId(userId))
                .recentlyViewedCount(recentlyViewedRepository.countByUserId(userId))
                .build();
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUser(userId);

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PgListingResponse> getFavorites(Long userId) {
        findUser(userId);
        return favoriteRepository.findByUserIdOrderBySavedAtDesc(userId).stream()
                .map(Favorite::getPgListing)
                .map(this::toListingResponseWithImages)
                .toList();
    }

    @Override
    @Transactional
    public void addFavorite(Long userId, Long pgId) {
        User user = findUser(userId);
        PgListing listing = pgListingRepository.findById(pgId)
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found"));

        if (favoriteRepository.existsByUserIdAndPgListingId(userId, pgId)) {
            throw new DuplicateResourceException("PG already in favorites");
        }

        favoriteRepository.save(Favorite.builder()
                .user(user)
                .pgListing(listing)
                .build());
    }

    @Override
    @Transactional
    public void removeFavorite(Long userId, Long pgId) {
        if (!favoriteRepository.existsByUserIdAndPgListingId(userId, pgId)) {
            throw new ResourceNotFoundException("Favorite not found");
        }
        favoriteRepository.deleteByUserIdAndPgListingId(userId, pgId);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private PgListingResponse toListingResponseWithImages(PgListing listing) {
        listing.getImages().size();
        return pgListingMapper.toResponse(listing);
    }
}

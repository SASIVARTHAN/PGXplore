package com.pgxplore.service.impl;

import com.pgxplore.dto.request.InquiryRequest;
import com.pgxplore.dto.response.InquiryResponse;
import com.pgxplore.exception.ResourceNotFoundException;
import com.pgxplore.mapper.InquiryMapper;
import com.pgxplore.model.entity.Inquiry;
import com.pgxplore.model.entity.PgListing;
import com.pgxplore.model.entity.User;
import com.pgxplore.repository.InquiryRepository;
import com.pgxplore.repository.PgListingRepository;
import com.pgxplore.repository.UserRepository;
import com.pgxplore.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InquiryServiceImpl implements InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final PgListingRepository pgListingRepository;
    private final InquiryMapper inquiryMapper;

    @Override
    @Transactional
    public InquiryResponse create(Long userId, InquiryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        PgListing listing = pgListingRepository.findById(request.getPgId())
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found"));

        Inquiry inquiry = Inquiry.builder()
                .user(user)
                .pgListing(listing)
                .message(request.getMessage())
                .contactNumber(request.getContactNumber())
                .build();

        return inquiryMapper.toResponse(inquiryRepository.save(inquiry));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InquiryResponse> getByUser(Long userId) {
        return inquiryMapper.toResponseList(
                inquiryRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InquiryResponse> getByOwner(Long ownerId) {
        return inquiryMapper.toResponseList(
                inquiryRepository.findByPgListingOwnerIdOrderByCreatedAtDesc(ownerId));
    }
}

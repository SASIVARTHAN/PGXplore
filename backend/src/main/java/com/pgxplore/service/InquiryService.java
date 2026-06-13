package com.pgxplore.service;

import com.pgxplore.dto.request.InquiryRequest;
import com.pgxplore.dto.response.InquiryResponse;

import java.util.List;

public interface InquiryService {

    InquiryResponse create(Long userId, InquiryRequest request);

    List<InquiryResponse> getByUser(Long userId);

    List<InquiryResponse> getByOwner(Long ownerId);
}

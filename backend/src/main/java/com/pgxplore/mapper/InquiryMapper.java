package com.pgxplore.mapper;

import com.pgxplore.dto.response.InquiryResponse;
import com.pgxplore.model.entity.Inquiry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InquiryMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.name", target = "userName")
    @Mapping(source = "pgListing.id", target = "pgId")
    @Mapping(source = "pgListing.name", target = "pgName")
    InquiryResponse toResponse(Inquiry inquiry);

    List<InquiryResponse> toResponseList(List<Inquiry> inquiries);
}

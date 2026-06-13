package com.pgxplore.mapper;

import com.pgxplore.dto.response.UserResponse;
import com.pgxplore.model.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "verified", target = "verified")
    UserResponse toResponse(User user);
}

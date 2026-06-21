package com.pgxplore.service;

import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.mapper.PgListingMapper;
import com.pgxplore.model.entity.PgListing;
import com.pgxplore.model.enums.Gender;
import com.pgxplore.repository.PgListingRepository;
import com.pgxplore.repository.specification.PgListingSpecification.SearchCriteria;
import com.pgxplore.service.impl.SearchServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock private PgListingRepository pgListingRepository;
    @Mock private PgListingMapper pgListingMapper;

    @InjectMocks
    private SearchServiceImpl searchService;

    @Test
    void search_filtersByCityAndMaxRent() {
        PgListing pg = PgListing.builder().id(1L).name("Green Nest PG").city("Chennai").rent(BigDecimal.valueOf(6500)).gender(Gender.BOYS).build();
        Page<PgListing> page = new PageImpl<>(List.of(pg), PageRequest.of(0, 10), 1);

        when(pgListingRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);
        when(pgListingMapper.toResponseList(any())).thenReturn(List.of(PgListingResponse.builder().id(1L).name("Green Nest PG").build()));

        SearchCriteria criteria = SearchCriteria.builder()
                .city("Chennai")
                .maxRent(BigDecimal.valueOf(7000))
                .build();

        PageResponse<PgListingResponse> result = searchService.search(criteria, 0, 10, "rent", "asc");

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Green Nest PG");
    }
}

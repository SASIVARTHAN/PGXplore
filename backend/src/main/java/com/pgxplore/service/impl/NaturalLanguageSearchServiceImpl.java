package com.pgxplore.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pgxplore.dto.request.NaturalSearchRequest;
import com.pgxplore.dto.response.PageResponse;
import com.pgxplore.dto.response.PgListingResponse;
import com.pgxplore.model.enums.Gender;
import com.pgxplore.repository.specification.PgListingSpecification.SearchCriteria;
import com.pgxplore.service.NaturalLanguageSearchService;
import com.pgxplore.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NaturalLanguageSearchServiceImpl implements NaturalLanguageSearchService {

    private final SearchService searchService;
    private final ObjectMapper objectMapper;

    @Value("${pgxplore.openai.api-key:}")
    private String openAiApiKey;

    @Value("${pgxplore.openai.model:gpt-3.5-turbo}")
    private String openAiModel;

    private static final String SYSTEM_PROMPT = """
            You extract PG accommodation search filters from natural language queries.
            Return ONLY valid JSON with these optional fields:
            city (string), area (string), minRent (number), maxRent (number),
            gender (BOYS|GIRLS|CO_LIVING), foodAvailable (boolean),
            wifi (boolean), ac (boolean), parking (boolean), laundry (boolean),
            minRating (number), availableBeds (integer), availableRooms (integer),
            keyword (string for free-text terms).
            Omit fields that are not mentioned. Use null for unknown values.
            """;

    @Override
    public PageResponse<PgListingResponse> search(NaturalSearchRequest request, int page, int size) {
        SearchCriteria criteria = parseQueryWithOpenAi(request.getQuery());
        return searchService.search(criteria, page, size, "createdAt", "desc");
    }

    private SearchCriteria parseQueryWithOpenAi(String query) {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            log.warn("OpenAI API key not configured, falling back to keyword search");
            return SearchCriteria.builder().keyword(query).build();
        }

        try {
            RestClient client = RestClient.builder()
                    .baseUrl("https://api.openai.com/v1")
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + openAiApiKey)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            Map<String, Object> body = Map.of(
                    "model", openAiModel,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", query)
                    )
            );

            String response = client.post()
                    .uri("/chat/completions")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").path(0).path("message").path("content").asText();
            JsonNode filters = objectMapper.readTree(content);

            return SearchCriteria.builder()
                    .city(textOrNull(filters, "city"))
                    .area(textOrNull(filters, "area"))
                    .minRent(decimalOrNull(filters, "minRent"))
                    .maxRent(decimalOrNull(filters, "maxRent"))
                    .gender(enumOrNull(filters, "gender"))
                    .foodAvailable(boolOrNull(filters, "foodAvailable"))
                    .wifi(boolOrNull(filters, "wifi"))
                    .ac(boolOrNull(filters, "ac"))
                    .parking(boolOrNull(filters, "parking"))
                    .laundry(boolOrNull(filters, "laundry"))
                    .minRating(decimalOrNull(filters, "minRating"))
                    .availableBeds(intOrNull(filters, "availableBeds"))
                    .availableRooms(intOrNull(filters, "availableRooms"))
                    .keyword(textOrNull(filters, "keyword"))
                    .build();
        } catch (Exception e) {
            log.error("OpenAI parsing failed, falling back to keyword search", e);
            return SearchCriteria.builder().keyword(query).build();
        }
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull() || value.asText().isBlank()) {
            return null;
        }
        return value.asText();
    }

    private BigDecimal decimalOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        return BigDecimal.valueOf(value.asDouble());
    }

    private Integer intOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        return value.asInt();
    }

    private Boolean boolOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        return value.asBoolean();
    }

    private Gender enumOrNull(JsonNode node, String field) {
        String value = textOrNull(node, field);
        if (value == null) {
            return null;
        }
        try {
            return Gender.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}

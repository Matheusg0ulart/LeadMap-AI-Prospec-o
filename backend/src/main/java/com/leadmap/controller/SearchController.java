package com.leadmap.controller;

import com.leadmap.dto.SearchRequestDto;
import com.leadmap.dto.SearchResponseDto;
import com.leadmap.service.SearchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @PostMapping
    public ResponseEntity<SearchResponseDto> search(@Valid @RequestBody SearchRequestDto request) {
        SearchResponseDto response = searchService.search(request);
        return ResponseEntity.ok(response);
    }
}

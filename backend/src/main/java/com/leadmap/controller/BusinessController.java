package com.leadmap.controller;

import com.leadmap.dto.AiAnalysisDto;
import com.leadmap.dto.BusinessDto;
import com.leadmap.entity.WebsiteStatus;
import com.leadmap.service.AiAnalysisService;
import com.leadmap.service.BusinessService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {

    private final BusinessService businessService;
    private final AiAnalysisService aiAnalysisService;

    public BusinessController(BusinessService businessService, AiAnalysisService aiAnalysisService) {
        this.businessService = businessService;
        this.aiAnalysisService = aiAnalysisService;
    }

    @GetMapping
    public ResponseEntity<List<BusinessDto>> listBusinesses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) WebsiteStatus websiteStatus,
            @RequestParam(required = false) Integer minScore,
            @RequestParam(required = false) Integer maxScore,
            @RequestParam(required = false) Double minRating
    ) {
        List<BusinessDto> list = businessService.listBusinesses(category, websiteStatus, minScore, maxScore, minRating);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessDto> getBusinessById(@PathVariable Long id) {
        BusinessDto dto = businessService.getBusinessById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<AiAnalysisDto> analyzeBusiness(@PathVariable Long id) {
        AiAnalysisDto analysis = aiAnalysisService.analyze(id);
        return ResponseEntity.ok(analysis);
    }
}

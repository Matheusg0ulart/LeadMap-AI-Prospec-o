package com.leadmap.controller;

import com.leadmap.dto.AiAnalysisDto;
import com.leadmap.dto.BusinessDto;
import com.leadmap.entity.Business;
import com.leadmap.entity.WebsiteStatus;
import com.leadmap.mapper.BusinessMapper;
import com.leadmap.repository.BusinessRepository;
import com.leadmap.repository.LeadRepository;
import com.leadmap.service.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {

    private final BusinessService businessService;
    private final AiAnalysisService aiAnalysisService;
    private final CnpjEnrichmentService cnpjEnrichmentService;
    private final ObjectionAssistantService objectionAssistantService;
    private final ReportExportService reportExportService;
    private final SocialMediaAnalyzerService socialMediaAnalyzerService;
    private final RoiCalculatorService roiCalculatorService;
    private final ContractGeneratorService contractGeneratorService;
    private final BusinessRepository businessRepository;
    private final LeadRepository leadRepository;
    private final BusinessMapper businessMapper;

    public BusinessController(BusinessService businessService,
                              AiAnalysisService aiAnalysisService,
                              CnpjEnrichmentService cnpjEnrichmentService,
                              ObjectionAssistantService objectionAssistantService,
                              ReportExportService reportExportService,
                              SocialMediaAnalyzerService socialMediaAnalyzerService,
                              RoiCalculatorService roiCalculatorService,
                              ContractGeneratorService contractGeneratorService,
                              BusinessRepository businessRepository,
                              LeadRepository leadRepository,
                              BusinessMapper businessMapper) {
        this.businessService = businessService;
        this.aiAnalysisService = aiAnalysisService;
        this.cnpjEnrichmentService = cnpjEnrichmentService;
        this.objectionAssistantService = objectionAssistantService;
        this.reportExportService = reportExportService;
        this.socialMediaAnalyzerService = socialMediaAnalyzerService;
        this.roiCalculatorService = roiCalculatorService;
        this.contractGeneratorService = contractGeneratorService;
        this.businessRepository = businessRepository;
        this.leadRepository = leadRepository;
        this.businessMapper = businessMapper;
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

    @PostMapping("/{id}/enrich-cnpj")
    public ResponseEntity<BusinessDto> enrichCnpjAndOwner(@PathVariable Long id) {
        Business enriched = cnpjEnrichmentService.enrichCnpjAndOwner(id);
        BusinessDto dto = businessMapper.toDto(enriched, leadRepository.findByBusinessId(enriched.getId()));
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/analyze-social")
    public ResponseEntity<Map<String, Object>> analyzeSocialMedia(@PathVariable Long id) {
        Map<String, Object> result = socialMediaAnalyzerService.analyzeSocialMedia(id);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/roi")
    public ResponseEntity<Map<String, Object>> getRoiCalculation(
            @PathVariable Long id,
            @RequestParam(required = false) Double ticket
    ) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Estabelecimento não encontrado com ID: " + id));

        Map<String, Object> roi = roiCalculatorService.calculateRoi(business, ticket);
        return ResponseEntity.ok(roi);
    }

    @GetMapping("/{id}/contract")
    public ResponseEntity<String> getContractHtml(
            @PathVariable Long id,
            @RequestParam(required = false) Double value,
            @RequestParam(required = false) Integer days
    ) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Estabelecimento não encontrado com ID: " + id));

        if (business.getOwnerName() == null || business.getCnpj() == null) {
            business = cnpjEnrichmentService.enrichCnpjAndOwner(id);
        }

        String html = contractGeneratorService.generateContractHtml(business, value, days);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    @GetMapping("/{id}/objections")
    public ResponseEntity<Map<String, Object>> getObjectionKit(@PathVariable Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Estabelecimento não encontrado com ID: " + id));

        if (business.getOwnerName() == null || business.getCnpj() == null) {
            business = cnpjEnrichmentService.enrichCnpjAndOwner(id);
        }

        Map<String, Object> kit = objectionAssistantService.generateObjectionKit(business);
        return ResponseEntity.ok(kit);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) WebsiteStatus websiteStatus,
            @RequestParam(required = false) Integer minScore,
            @RequestParam(required = false) Integer maxScore,
            @RequestParam(required = false) Double minRating
    ) {
        List<BusinessDto> list = businessService.listBusinesses(category, websiteStatus, minScore, maxScore, minRating);
        String csvContent = reportExportService.generateCsv(list);
        byte[] bytes = csvContent.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"leadmap-prospeccao-export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    @GetMapping("/{id}/audit-report")
    public ResponseEntity<String> getAuditReportHtml(@PathVariable Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Estabelecimento não encontrado com ID: " + id));

        if (business.getOwnerName() == null || business.getCnpj() == null) {
            business = cnpjEnrichmentService.enrichCnpjAndOwner(id);
        }

        String html = reportExportService.generateAuditReportHtml(business);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    @PutMapping("/{id}/phone")
    public ResponseEntity<BusinessDto> updatePhone(
            @PathVariable Long id,
            @RequestBody @jakarta.validation.Valid com.leadmap.dto.BusinessPhoneUpdateDto dto
    ) {
        BusinessDto updated = businessService.updatePhone(id, dto.getPhone());
        return ResponseEntity.ok(updated);
    }
}

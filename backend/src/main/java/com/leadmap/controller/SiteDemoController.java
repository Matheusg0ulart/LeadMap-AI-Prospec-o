package com.leadmap.controller;

import com.leadmap.dto.BusinessDto;
import com.leadmap.dto.SiteDemoDto;
import com.leadmap.service.SiteDemoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demo")
public class SiteDemoController {

    private final SiteDemoService siteDemoService;

    public SiteDemoController(SiteDemoService siteDemoService) {
        this.siteDemoService = siteDemoService;
    }

    @GetMapping("/{businessId}")
    public ResponseEntity<SiteDemoDto> getDemoForBusiness(
            @PathVariable Long businessId,
            @RequestHeader(value = "Origin", required = false) String origin,
            HttpServletRequest request
    ) {
        String baseUrl = resolveBaseUrl(origin, request);
        SiteDemoDto demo = siteDemoService.generateDemoForBusinessId(businessId, baseUrl);
        return ResponseEntity.ok(demo);
    }

    @PostMapping("/preview")
    public ResponseEntity<SiteDemoDto> generateDemoPreview(
            @RequestBody BusinessDto dto,
            @RequestHeader(value = "Origin", required = false) String origin,
            HttpServletRequest request
    ) {
        String baseUrl = resolveBaseUrl(origin, request);
        SiteDemoDto demo = siteDemoService.generateDemoFromDto(dto, baseUrl);
        return ResponseEntity.ok(demo);
    }

    private String resolveBaseUrl(String origin, HttpServletRequest request) {
        if (origin != null && !origin.isBlank()) {
            return origin;
        }
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();

        // If standard port
        if ((scheme.equals("http") && serverPort == 80) || (scheme.equals("https") && serverPort == 443)) {
            return scheme + "://" + serverName;
        }
        // Em dev, apontar para frontend porta 4200 se a requisição veio do backend
        if (serverPort == 8080) {
            return "http://" + serverName + ":4200";
        }
        return scheme + "://" + serverName + ":" + serverPort;
    }
}

package com.leadmap.controller;

import com.leadmap.service.DomainCheckService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/domains")
public class DomainController {

    private final DomainCheckService domainCheckService;

    public DomainController(DomainCheckService domainCheckService) {
        this.domainCheckService = domainCheckService;
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkDomain(
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String name) {

        String targetDomain = domain;
        if ((targetDomain == null || targetDomain.isBlank()) && name != null && !name.isBlank()) {
            targetDomain = domainCheckService.suggestDomain(name);
        }

        if (targetDomain == null || targetDomain.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Boolean available = domainCheckService.checkAvailability(targetDomain);

        Map<String, Object> result = new HashMap<>();
        result.put("domain", targetDomain);
        result.put("available", available);
        result.put("status", available == null ? "UNKNOWN" : (available ? "AVAILABLE" : "REGISTERED"));
        result.put("statusLabel", available == null ? "Consulta pendente" : (available ? "Disponível para registro" : "Já registrado"));
        result.put("registryUrl", "https://registro.br/busca-dominio/?fqdn=" + targetDomain);

        return ResponseEntity.ok(result);
    }
}

package com.leadmap.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
public class DomainCheckService {

    private static final Logger log = LoggerFactory.getLogger(DomainCheckService.class);
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]");
    private static final Pattern ACCENTS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    private final HttpClient httpClient;
    private final Map<String, Boolean> domainCache = new ConcurrentHashMap<>();

    public DomainCheckService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    /**
     * Sugere um domínio .com.br limpo a partir do nome fantasia do estabelecimento
     */
    public String suggestDomain(String businessName) {
        if (businessName == null || businessName.trim().isEmpty()) {
            return null;
        }

        // Normaliza e remove acentos
        String normalized = Normalizer.normalize(businessName.toLowerCase().trim(), Normalizer.Form.NFD);
        normalized = ACCENTS.matcher(normalized).replaceAll("");

        // Remove sufixos ou prefixos desnecessários como "ltda", "me", "eireli"
        normalized = normalized.replaceAll("\\b(ltda|me|epp|eireli|s/a|sa)\\b", "");

        // Remove caracteres não alfanuméricos
        String clean = NON_ALPHANUMERIC.matcher(normalized).replaceAll("");

        if (clean.length() < 3) {
            clean = clean + "sp";
        }
        if (clean.length() > 26) {
            clean = clean.substring(0, 26);
        }

        return clean + ".com.br";
    }

    /**
     * Verifica disponibilidade no Registro.br via RDAP oficial.
     * Retorna:
     * - true se DISPONÍVEL (HTTP 404 no RDAP)
     * - false se REGISTRADO (HTTP 200 no RDAP)
     * - null em caso de timeout / indisponibilidade
     */
    public Boolean checkAvailability(String domain) {
        if (domain == null || !domain.endsWith(".com.br")) {
            return null;
        }

        // Consulta cache em memória
        if (domainCache.containsKey(domain)) {
            return domainCache.get(domain);
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://rdap.registro.br/domain/" + domain))
                    .header("User-Agent", "LeadMapAI/1.0 (registro-checker@leadmap.ai)")
                    .header("Accept", "application/rdap+json")
                    .timeout(Duration.ofSeconds(2))
                    .GET()
                    .build();

            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());

            int status = response.statusCode();
            if (status == 404) {
                // 404 = Domínio não encontrado = DISPONÍVEL para registro
                domainCache.put(domain, true);
                return true;
            } else if (status == 200) {
                // 200 = Domínio existe = JÁ REGISTRADO
                domainCache.put(domain, false);
                return false;
            } else {
                log.debug("RDAP respondeu com status inesperado {} para domínio {}", status, domain);
            }
        } catch (Exception e) {
            log.debug("Não foi possível verificar domínio {} em tempo hábil: {}", domain, e.getMessage());
        }

        return null;
    }
}

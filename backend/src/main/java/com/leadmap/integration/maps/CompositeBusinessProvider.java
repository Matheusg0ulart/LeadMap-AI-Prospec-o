package com.leadmap.integration.maps;

import com.leadmap.entity.Business;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Primary
@Component("compositeBusinessProvider")
public class CompositeBusinessProvider implements BusinessProvider {

    private static final Logger log = LoggerFactory.getLogger(CompositeBusinessProvider.class);

    private final GoogleBusinessProvider googleProvider;
    private final FreeBusinessAggregatorProvider freeAggregatorProvider;
    private final SeedBusinessProvider seedProvider;

    public CompositeBusinessProvider(GoogleBusinessProvider googleProvider,
                                     FreeBusinessAggregatorProvider freeAggregatorProvider,
                                     SeedBusinessProvider seedProvider) {
        this.googleProvider = googleProvider;
        this.freeAggregatorProvider = freeAggregatorProvider;
        this.seedProvider = seedProvider;
    }

    @Override
    public String getProviderName() {
        return "Composite Business Provider (Multi-Source Free & Paid)";
    }

    @Override
    public List<Business> searchBusinesses(String location, String category, int radiusMeters) {
        // 1. Tentar Google Places se chave de API estiver explicitamente configurada
        try {
            List<Business> googleResults = googleProvider.searchBusinesses(location, category, radiusMeters);
            if (googleResults != null && !googleResults.isEmpty()) {
                log.info("Encontrados {} estabelecimentos via Google Places API", googleResults.size());
                return googleResults;
            }
        } catch (Exception e) {
            log.debug("Google Places não utilizado ou sem chave: {}", e.getMessage());
        }

        // 2. Prospecção paralela em Múltiplos Provedores GRATUITOS (Photon + Overpass + Nominatim)
        List<Business> freeResults = new ArrayList<>();
        try {
            freeResults = freeAggregatorProvider.searchBusinesses(location, category, radiusMeters);
            if (freeResults != null && !freeResults.isEmpty()) {
                log.info("Encontrados {} estabelecimentos via Provedores Gratuitos de Mapas", freeResults.size());

                // Se obteve boa quantidade de dados reais (> 10), retorna imediatamente
                if (freeResults.size() >= 10) {
                    return freeResults;
                }
            }
        } catch (Exception e) {
            log.warn("Agregador de provedores gratuitos falhou: {}", e.getMessage());
        }

        // 3. Suplementação / Contingência com Seed Provider para garantir volume e zero falha
        log.info("Complementando resultados com Seed Provider para localização '{}' e categoria '{}'", location, category);
        List<Business> seedResults = seedProvider.searchBusinesses(location, category, radiusMeters);

        if (freeResults != null && !freeResults.isEmpty()) {
            List<Business> combined = new ArrayList<>(freeResults);
            Set<String> existingNames = new HashSet<>();
            for (Business b : freeResults) {
                if (b.getName() != null) {
                    existingNames.add(b.getName().toLowerCase().replaceAll("[^a-z0-9]", ""));
                }
            }
            for (Business s : seedResults) {
                String norm = s.getName() != null ? s.getName().toLowerCase().replaceAll("[^a-z0-9]", "") : "";
                if (!existingNames.contains(norm)) {
                    combined.add(s);
                }
            }
            return combined;
        }

        return seedResults;
    }
}

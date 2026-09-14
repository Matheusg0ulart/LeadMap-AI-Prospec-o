package com.leadmap.integration.maps;

import com.leadmap.entity.Business;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;

@Primary
@Component("compositeBusinessProvider")
public class CompositeBusinessProvider implements BusinessProvider {

    private static final Logger log = LoggerFactory.getLogger(CompositeBusinessProvider.class);

    private final GoogleBusinessProvider googleProvider;
    private final OverpassBusinessProvider overpassProvider;
    private final SeedBusinessProvider seedProvider;

    public CompositeBusinessProvider(GoogleBusinessProvider googleProvider,
                                     OverpassBusinessProvider overpassProvider,
                                     SeedBusinessProvider seedProvider) {
        this.googleProvider = googleProvider;
        this.overpassProvider = overpassProvider;
        this.seedProvider = seedProvider;
    }

    @Override
    public String getProviderName() {
        return "Composite Business Provider";
    }

    @Override
    public List<Business> searchBusinesses(String location, String category, int radiusMeters) {
        // 1. Tentar Google Places se configurado
        try {
            List<Business> googleResults = googleProvider.searchBusinesses(location, category, radiusMeters);
            if (googleResults != null && !googleResults.isEmpty()) {
                log.info("Encontrados {} estabelecimentos via Google Places", googleResults.size());
                return googleResults;
            }
        } catch (Exception e) {
            log.debug("Google Places não utilizado ou falhou: {}", e.getMessage());
        }

        // 2. Tentar OpenStreetMap / Overpass
        try {
            List<Business> osmResults = overpassProvider.searchBusinesses(location, category, radiusMeters);
            if (osmResults != null && !osmResults.isEmpty()) {
                log.info("Encontrados {} estabelecimentos via OpenStreetMap / Overpass", osmResults.size());
                return osmResults;
            }
        } catch (Exception e) {
            log.warn("Overpass API falhou ou atingiu timeout: {}. Utilizando Seed Provider de contingência.", e.getMessage());
        }

        // 3. Contingência / Dados curados de alta qualidade
        log.info("Utilizando Seed Provider para localização '{}' e categoria '{}'", location, category);
        return seedProvider.searchBusinesses(location, category, radiusMeters);
    }
}

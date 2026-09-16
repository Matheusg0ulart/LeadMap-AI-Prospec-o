package com.leadmap.integration.maps;

import com.leadmap.entity.Business;
import com.leadmap.entity.WebsiteStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.*;

@Component("freeBusinessAggregatorProvider")
public class FreeBusinessAggregatorProvider implements BusinessProvider {

    private static final Logger log = LoggerFactory.getLogger(FreeBusinessAggregatorProvider.class);

    private final OverpassBusinessProvider overpassProvider;
    private final PhotonBusinessProvider photonProvider;
    private final NominatimBusinessProvider nominatimProvider;
    private final ExecutorService executorService;

    public FreeBusinessAggregatorProvider(OverpassBusinessProvider overpassProvider,
                                          PhotonBusinessProvider photonProvider,
                                          NominatimBusinessProvider nominatimProvider) {
        this.overpassProvider = overpassProvider;
        this.photonProvider = photonProvider;
        this.nominatimProvider = nominatimProvider;
        this.executorService = Executors.newFixedThreadPool(4);
    }

    @Override
    public String getProviderName() {
        return "Free Multi-Map Business Aggregator";
    }

    @Override
    public List<Business> searchBusinesses(String location, String category, int radiusMeters) {
        log.info("Iniciando busca paralela agregada em fontes gratuitas para '{}', categoria '{}'", location, category);
        long startTime = System.currentTimeMillis();

        CompletableFuture<List<Business>> overpassFuture = CompletableFuture.supplyAsync(
                () -> overpassProvider.searchBusinesses(location, category, radiusMeters), executorService
        ).exceptionally(ex -> {
            log.warn("Erro no provedor Overpass: {}", ex.getMessage());
            return Collections.emptyList();
        });

        CompletableFuture<List<Business>> photonFuture = CompletableFuture.supplyAsync(
                () -> photonProvider.searchBusinesses(location, category, radiusMeters), executorService
        ).exceptionally(ex -> {
            log.warn("Erro no provedor Photon: {}", ex.getMessage());
            return Collections.emptyList();
        });

        CompletableFuture<List<Business>> nominatimFuture = CompletableFuture.supplyAsync(
                () -> nominatimProvider.searchBusinesses(location, category, radiusMeters), executorService
        ).exceptionally(ex -> {
            log.warn("Erro no provedor Nominatim: {}", ex.getMessage());
            return Collections.emptyList();
        });

        CompletableFuture<Void> allFutures = CompletableFuture.allOf(overpassFuture, photonFuture, nominatimFuture);

        try {
            // Limite global de 4 segundos para máxima agilidade
            allFutures.get(4, TimeUnit.SECONDS);
        } catch (TimeoutException te) {
            log.warn("Timeout atingido na busca paralela de provedores gratuitos (4s). Processando resultados parciais...");
        } catch (Exception e) {
            log.warn("Falha durante aglutinação paralela de provedores: {}", e.getMessage());
        }

        List<Business> overpassList = overpassFuture.getNow(Collections.emptyList());
        List<Business> photonList = photonFuture.getNow(Collections.emptyList());
        List<Business> nominatimList = nominatimFuture.getNow(Collections.emptyList());

        List<Business> combinedRaw = new ArrayList<>();
        if (photonList != null) combinedRaw.addAll(photonList);
        if (overpassList != null) combinedRaw.addAll(overpassList);
        if (nominatimList != null) combinedRaw.addAll(nominatimList);

        log.info("Total bruto obtido das fontes gratuitas: Photon={}, Overpass={}, Nominatim={}",
                photonList != null ? photonList.size() : 0,
                overpassList != null ? overpassList.size() : 0,
                nominatimList != null ? nominatimList.size() : 0);

        List<Business> deduplicated = deduplicateAndEnrich(combinedRaw);

        long duration = System.currentTimeMillis() - startTime;
        log.info("Agregação concluída em {}ms com {} estabelecimentos únicos gratuitos", duration, deduplicated.size());

        return deduplicated;
    }

    private List<Business> deduplicateAndEnrich(List<Business> rawList) {
        List<Business> uniqueList = new ArrayList<>();

        for (Business item : rawList) {
            if (item.getName() == null || item.getName().trim().isEmpty()) {
                continue;
            }

            String normName = normalizeString(item.getName());
            boolean isDuplicate = false;

            for (Business existing : uniqueList) {
                String existingNormName = normalizeString(existing.getName());

                // Verificar proximidade de nome e geografica (menos de ~100m)
                boolean nameMatch = normName.equalsIgnoreCase(existingNormName) ||
                        (normName.length() > 6 && existingNormName.length() > 6 &&
                                (normName.contains(existingNormName) || existingNormName.contains(normName)));

                boolean isClose = isGeographicallyClose(
                        item.getLatitude(), item.getLongitude(),
                        existing.getLatitude(), existing.getLongitude()
                );

                if (nameMatch || (isClose && computeSimilarity(normName, existingNormName) > 0.7)) {
                    isDuplicate = true;
                    // Enriquecer registro existente com dados faltantes do novo item
                    enrichBusiness(existing, item);
                    break;
                }
            }

            if (!isDuplicate) {
                uniqueList.add(item);
            }
        }

        return uniqueList;
    }

    private void enrichBusiness(Business target, Business source) {
        if ((target.getPhone() == null || target.getPhone().isEmpty()) && source.getPhone() != null) {
            target.setPhone(source.getPhone());
        }
        if ((target.getWebsite() == null || target.getWebsite().isEmpty()) && source.getWebsite() != null) {
            target.setWebsite(source.getWebsite());
            if (target.getWebsiteStatus() != WebsiteStatus.FOUND) {
                target.setWebsiteStatus(WebsiteStatus.FOUND);
            }
        }
        if ((target.getInstagram() == null || target.getInstagram().isEmpty()) && source.getInstagram() != null) {
            target.setInstagram(source.getInstagram());
        }
        if (source.getReviewCount() > target.getReviewCount()) {
            target.setReviewCount(source.getReviewCount());
        }
        if (target.getSource() != null && source.getSource() != null && !target.getSource().contains(source.getSource())) {
            target.setSource(target.getSource() + " + " + source.getSource());
        }
    }

    private boolean isGeographicallyClose(double lat1, double lon1, double lat2, double lon2) {
        if (lat1 == 0 || lon1 == 0 || lat2 == 0 || lon2 == 0) return false;
        double dLat = Math.abs(lat1 - lat2);
        double dLon = Math.abs(lon1 - lon2);
        return dLat < 0.0015 && dLon < 0.0015; // aprox 150m
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        return input.toLowerCase()
                .replaceAll("[áàãâä]", "a")
                .replaceAll("[éèêë]", "e")
                .replaceAll("[íìîï]", "i")
                .replaceAll("[óòõôö]", "o")
                .replaceAll("[úùûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9]", "");
    }

    private double computeSimilarity(String s1, String s2) {
        if (s1.equals(s2)) return 1.0;
        if (s1.isEmpty() || s2.isEmpty()) return 0.0;
        int longer = Math.max(s1.length(), s2.length());
        int shorter = Math.min(s1.length(), s2.length());
        if (longer == 0) return 1.0;
        return (double) shorter / (double) longer;
    }
}

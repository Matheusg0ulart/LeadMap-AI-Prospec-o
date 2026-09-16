package com.leadmap.integration.maps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadmap.entity.Business;
import com.leadmap.entity.WebsiteStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Component("googleBusinessProvider")
public class GoogleBusinessProvider implements BusinessProvider {

    private static final Logger log = LoggerFactory.getLogger(GoogleBusinessProvider.class);

    @Value("${app.maps.google-api-key:${GOOGLE_MAPS_API_KEY:}}")
    private String apiKey;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GoogleBusinessProvider() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String getProviderName() {
        return "Google Places API";
    }

    @Override
    public List<Business> searchBusinesses(String location, String category, int radiusMeters) {
        List<Business> results = new ArrayList<>();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.info("Google Maps API Key não configurada. Pule para próximo provedor.");
            return results;
        }

        String query = category + " em " + location;
        log.info("Buscando dados em tempo real no Google Places API: '{}'", query);

        // 1. Tentar primeiro a nova Places API (New - v1)
        results = searchBusinessesNewApi(query, category);
        if (results != null && !results.isEmpty()) {
            log.info("Encontrados {} estabelecimentos via Google Places API (New)", results.size());
            return results;
        }

        // 2. Fallback para a Places API (Legacy)
        results = searchBusinessesLegacyApi(query, category, radiusMeters);
        return results;
    }

    private List<Business> searchBusinessesNewApi(String query, String category) {
        List<Business> list = new ArrayList<>();
        try {
            String jsonPayload = String.format(
                    "{\"textQuery\": \"%s\", \"languageCode\": \"pt-BR\"}",
                    query.replace("\"", "\\\"")
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://places.googleapis.com/v1/places:searchText"))
                    .header("Content-Type", "application/json")
                    .header("X-Goog-Api-Key", apiKey)
                    .header("X-Goog-FieldMask", "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode places = root.path("places");

                if (places.isArray() && places.size() > 0) {
                    for (JsonNode place : places) {
                        String name = place.path("displayName").path("text").asText();
                        if (name == null || name.isBlank()) continue;

                        String placeId = place.path("id").asText();
                        String address = place.path("formattedAddress").asText();
                        double lat = place.path("location").path("latitude").asDouble(0.0);
                        double lng = place.path("location").path("longitude").asDouble(0.0);
                        double rating = place.path("rating").asDouble(4.0);
                        int reviewCount = place.path("userRatingCount").asInt(0);

                        String website = place.path("websiteUri").asText(null);
                        String phone = place.path("nationalPhoneNumber").asText(null);
                        if (phone == null || phone.isBlank()) {
                            phone = place.path("internationalPhoneNumber").asText(null);
                        }

                        Business business = new Business();
                        business.setExternalId("google-" + placeId);
                        business.setName(name);
                        business.setCategory(category);
                        business.setAddress(address);
                        business.setLatitude(lat);
                        business.setLongitude(lng);
                        business.setRating(rating);
                        business.setReviewCount(reviewCount);
                        business.setWebsite(website);
                        business.setPhone(phone);
                        business.setSource("Google Places API (New)");

                        if (website != null && !website.trim().isEmpty()) {
                            business.setWebsiteStatus(WebsiteStatus.FOUND);
                        } else {
                            business.setWebsiteStatus(WebsiteStatus.NOT_FOUND);
                        }

                        list.add(business);
                    }
                }
            } else {
                log.warn("Google Places API (New) retornou HTTP {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Erro ao consultar Google Places API (New): {}", e.getMessage());
        }
        return list;
    }

    private List<Business> searchBusinessesLegacyApi(String query, String category, int radiusMeters) {
        List<Business> list = new ArrayList<>();
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format(
                    "https://maps.googleapis.com/maps/api/place/textsearch/json?query=%s&radius=%d&key=%s",
                    encodedQuery, radiusMeters, apiKey
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                String status = root.path("status").asText("UNKNOWN");

                if (!"OK".equals(status) && !"ZERO_RESULTS".equals(status)) {
                    String errorMsg = root.path("error_message").asText("Sem mensagem detalhada");
                    log.warn("Google Places API (Legacy) retornou status '{}': {}", status, errorMsg);
                }

                JsonNode places = root.path("results");

                if (places.isArray() && places.size() > 0) {
                    for (JsonNode place : places) {
                        String name = place.path("name").asText();
                        String placeId = place.path("place_id").asText();
                        String address = place.path("formatted_address").asText();
                        double lat = place.path("geometry").path("location").path("lat").asDouble();
                        double lng = place.path("geometry").path("location").path("lng").asDouble();
                        double rating = place.path("rating").asDouble(4.0);
                        int userRatingsTotal = place.path("user_ratings_total").asInt(0);

                        Business business = new Business();
                        business.setExternalId("google-" + placeId);
                        business.setName(name);
                        business.setCategory(category);
                        business.setAddress(address);
                        business.setLatitude(lat);
                        business.setLongitude(lng);
                        business.setRating(rating);
                        business.setReviewCount(userRatingsTotal);
                        business.setSource("Google Places API (Legacy)");

                        fetchPlaceDetails(placeId, business);
                        list.add(business);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Erro ao buscar no Google Places (Legacy): {}", e.getMessage());
        }
        return list;
    }

    private void fetchPlaceDetails(String placeId, Business business) {
        try {
            String url = String.format(
                    "https://maps.googleapis.com/maps/api/place/details/json?place_id=%s&fields=website,formatted_phone_number,international_phone_number&key=%s",
                    placeId, apiKey
            );
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode result = root.path("result");
                String website = result.path("website").asText(null);
                
                String phone = result.path("formatted_phone_number").asText(null);
                if (phone == null || phone.isBlank()) {
                    phone = result.path("international_phone_number").asText(null);
                }

                business.setWebsite(website);
                business.setPhone(phone);

                if (website != null && !website.trim().isEmpty()) {
                    business.setWebsiteStatus(WebsiteStatus.FOUND);
                } else {
                    business.setWebsiteStatus(WebsiteStatus.NOT_FOUND);
                }
            }
        } catch (Exception e) {
            log.debug("Erro ao obter detalhes adicionais do Google Place {}: {}", placeId, e.getMessage());
            business.setWebsiteStatus(WebsiteStatus.UNKNOWN);
        }
    }
}

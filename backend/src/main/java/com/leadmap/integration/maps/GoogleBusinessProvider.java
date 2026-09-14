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

    @Value("${app.maps.google-api-key:}")
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

        try {
            String query = category + " em " + location;
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
                JsonNode places = root.path("results");

                if (places.isArray()) {
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
                        business.setSource("Google Places");

                        // Obter detalhes adicionais (site, telefone)
                        fetchPlaceDetails(placeId, business);

                        results.add(business);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Erro ao buscar no Google Places: {}", e.getMessage());
        }

        return results;
    }

    private void fetchPlaceDetails(String placeId, Business business) {
        try {
            String url = String.format(
                    "https://maps.googleapis.com/maps/api/place/details/json?place_id=%s&fields=website,formatted_phone_number&key=%s",
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

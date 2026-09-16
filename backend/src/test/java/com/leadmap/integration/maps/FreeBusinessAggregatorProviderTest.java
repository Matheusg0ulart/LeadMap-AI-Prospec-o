package com.leadmap.integration.maps;

import com.leadmap.entity.Business;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FreeBusinessAggregatorProviderTest {

    private FreeBusinessAggregatorProvider aggregatorProvider;

    @BeforeEach
    void setUp() {
        OverpassBusinessProvider overpassProvider = new OverpassBusinessProvider();
        PhotonBusinessProvider photonProvider = new PhotonBusinessProvider();
        NominatimBusinessProvider nominatimProvider = new NominatimBusinessProvider();
        aggregatorProvider = new FreeBusinessAggregatorProvider(overpassProvider, photonProvider, nominatimProvider);
    }

    @Test
    void testGetProviderName() {
        assertEquals("Free Multi-Map Business Aggregator", aggregatorProvider.getProviderName());
    }

    @Test
    void testSearchBusinessesDoesNotThrowException() {
        assertDoesNotThrow(() -> {
            List<Business> results = aggregatorProvider.searchBusinesses("São Paulo", "Barbearia", 1000);
            assertNotNull(results);
        });
    }
}

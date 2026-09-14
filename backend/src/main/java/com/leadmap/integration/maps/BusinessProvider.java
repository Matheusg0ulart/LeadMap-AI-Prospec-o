package com.leadmap.integration.maps;

import com.leadmap.entity.Business;
import java.util.List;

public interface BusinessProvider {
    List<Business> searchBusinesses(String location, String category, int radiusMeters);
    String getProviderName();
}

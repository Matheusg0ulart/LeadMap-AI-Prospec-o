package com.leadmap.service;

import com.leadmap.entity.Business;
import com.leadmap.entity.WebsiteStatus;
import com.leadmap.repository.BusinessRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class CnpjEnrichmentServiceTest {

    private BusinessRepository businessRepository;
    private CnpjEnrichmentService cnpjEnrichmentService;

    @BeforeEach
    void setUp() {
        businessRepository = Mockito.mock(BusinessRepository.class);
        cnpjEnrichmentService = new CnpjEnrichmentService(businessRepository);
    }

    @Test
    void testEnrichCnpjAndOwnerPopulatesOwnerAndCnpj() {
        Business business = new Business();
        business.setId(1L);
        business.setName("Barbearia Imperial");
        business.setAddress("Rua Apucarana, 942 - Tatuapé, São Paulo");
        business.setCategory("Barbearia");
        business.setWebsiteStatus(WebsiteStatus.NOT_FOUND);

        when(businessRepository.findById(1L)).thenReturn(Optional.of(business));
        when(businessRepository.save(any(Business.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Business enriched = cnpjEnrichmentService.enrichCnpjAndOwner(1L);

        assertNotNull(enriched);
        assertNotNull(enriched.getCnpj());
        assertNotNull(enriched.getOwnerName());
        assertNotNull(enriched.getLegalName());
        assertTrue(enriched.getLeadScore() > 0);
    }
}

package com.leadmap.integration.ai;

import com.leadmap.dto.AiAnalysisDto;
import com.leadmap.entity.Business;

public interface AiAnalysisProvider {
    AiAnalysisDto analyzeBusiness(Business business);
}

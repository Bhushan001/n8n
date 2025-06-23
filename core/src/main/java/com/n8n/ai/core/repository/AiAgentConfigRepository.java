package com.n8n.ai.core.repository;

import com.n8n.ai.core.entity.AiAgentConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiAgentConfigRepository extends JpaRepository<AiAgentConfig, Long> {
    // Custom query methods for AiAgentConfig if needed
}

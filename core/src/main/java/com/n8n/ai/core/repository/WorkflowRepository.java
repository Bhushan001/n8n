package com.n8n.ai.core.repository;

import com.n8n.ai.core.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    long countByIsActiveTrue();

    // Custom query methods for Workflow if needed
}

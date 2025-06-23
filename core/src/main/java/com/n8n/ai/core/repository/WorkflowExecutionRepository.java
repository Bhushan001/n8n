package com.n8n.ai.core.repository;

import com.n8n.ai.core.entity.WorkflowExecution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowExecutionRepository extends JpaRepository<WorkflowExecution, Long> {
    List<WorkflowExecution> findByWorkflowIdOrderByStartTimeDesc(Long workflowId);
}

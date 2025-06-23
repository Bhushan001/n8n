package com.n8n.ai.core.repository;

import com.n8n.ai.core.entity.WorkflowExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkflowExecutionRepository extends JpaRepository<WorkflowExecution, Long> {
    List<WorkflowExecution> findByWorkflowIdOrderByStartedAtDesc(Long workflowId);
    
    @Query("SELECT COUNT(e) FROM WorkflowExecution e WHERE e.status = :status")
    long countByStatus(@Param("status") String status);
}

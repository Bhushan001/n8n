package com.n8n.ai.core.repository;

import com.n8n.ai.core.entity.NodeExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NodeExecutionRepository extends JpaRepository<NodeExecution, Long> {
    List<NodeExecution> findByExecutionIdOrderByStartTimeAsc(Long executionId);
}

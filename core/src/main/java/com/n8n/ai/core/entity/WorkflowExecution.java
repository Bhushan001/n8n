package com.n8n.ai.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowExecution { // This entity is specifically for execution, not directly user-audited in the same way
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long workflowId; // Foreign key to Workflow
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // e.g., "RUNNING", "COMPLETED", "FAILED"

    @Column(columnDefinition = "jsonb")
    private String logsJson; // Stores execution logs as JSON string
}

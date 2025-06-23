package com.n8n.ai.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

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
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    private String status; // "RUNNING", "COMPLETED", "FAILED", "CANCELLED"

    @Column(columnDefinition = "jsonb")
    private String input; // Input data for the workflow
    
    @Column(columnDefinition = "jsonb")
    private String result; // Execution result
    
    @Column(columnDefinition = "jsonb")
    private String error; // Error message if failed
    
    @Column(name = "execution_time")
    private Long executionTime; // Execution time in milliseconds

    @Column(columnDefinition = "jsonb")
    private String logsJson; // Execution logs
}

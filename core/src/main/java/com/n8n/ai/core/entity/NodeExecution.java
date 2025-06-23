package com.n8n.ai.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "node_executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NodeExecution { // This entity is specifically for execution, not directly user-audited in the same way
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long executionId; // Foreign key to WorkflowExecution
    private String nodeId; // ID of the node within the workflow definition
    private String nodeType; // e.g., "aiAgent", "httpRequest"
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // e.g., "SUCCESS", "FAILED"

    @Column(columnDefinition = "jsonb")
    private String inputDataJson; // Input data to the node as JSON string

    @Column(columnDefinition = "jsonb")
    private String outputDataJson; // Output data from the node as JSON string
    private String errorMessage; // If failed
}


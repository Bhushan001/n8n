package com.n8n.ai.core.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO to send through RabbitMQ
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowExecutionRequest {
    private Long workflowId;
    private Long executionId; // The ID of the workflow_execution record
}
package com.n8n.ai.core.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

// DTO to send through RabbitMQ
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowExecutionRequest {
    private Long workflowId;
    private Map<String, Object> input;
    private Map<String, Object> parameters;
}
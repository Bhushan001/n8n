package com.n8n.ai.core.component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.n8n.ai.core.entity.NodeExecution;
import com.n8n.ai.core.entity.Workflow;
import com.n8n.ai.core.entity.WorkflowExecution;
import com.n8n.ai.core.model.WorkflowExecutionRequest;
import com.n8n.ai.core.repository.NodeExecutionRepository;
import com.n8n.ai.core.repository.WorkflowExecutionRepository;
import com.n8n.ai.core.repository.WorkflowRepository;
import com.n8n.ai.core.service.AiAgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WorkflowExecutionListener {

    private final WorkflowRepository workflowRepository;
    private final WorkflowExecutionRepository workflowExecutionRepository;
    private final NodeExecutionRepository nodeExecutionRepository;
    private final AiAgentService aiAgentService; // Inject AI service
    private final ObjectMapper objectMapper;


    @RabbitListener(queues = "workflow-queue")
    public void processWorkflowExecution(String message) {
        WorkflowExecutionRequest request;
        try {
            request = objectMapper.readValue(message, WorkflowExecutionRequest.class);
        } catch (Exception e) {
            System.err.println("Failed to parse workflow execution request: " + e.getMessage());
            return;
        }

        Long workflowId = request.getWorkflowId();
        Long executionId = request.getExecutionId();

        Optional<Workflow> workflowOpt = workflowRepository.findById(workflowId);
        Optional<WorkflowExecution> executionOpt = workflowExecutionRepository.findById(executionId);

        if (workflowOpt.isEmpty() || executionOpt.isEmpty()) {
            System.err.println("Workflow or Execution record not found for ID: " + workflowId + ", " + executionId);
            return;
        }

        Workflow workflow = workflowOpt.get();
        WorkflowExecution execution = executionOpt.get();
        execution.setStatus("RUNNING");
        workflowExecutionRepository.save(execution); // Update status to Running

        try {
            // Parse the workflow definition JSON
            JsonNode workflowDefinition = objectMapper.readTree(workflow.getDefinitionJson());
            JsonNode nodesNode = workflowDefinition.get("nodes");
            JsonNode edgesNode = workflowDefinition.get("edges");

            if (nodesNode == null || !nodesNode.isArray() || edgesNode == null || !edgesNode.isArray()) {
                throw new RuntimeException("Invalid workflow definition JSON structure.");
            }

            // Simple execution: Find the trigger node and execute sequentially.
            // A real n8n would have a more sophisticated DAG (Directed Acyclic Graph) executor.
            JsonNode triggerNode = null;
            for (JsonNode node : nodesNode) {
                if (node.get("type").asText().contains("trigger")) { // Simplified check for trigger
                    triggerNode = node;
                    break;
                }
            }

            if (triggerNode == null) {
                throw new RuntimeException("No trigger node found in workflow.");
            }

            // This map holds the output of executed nodes, acting as context
            Map<String, JsonNode> executionContext = new HashMap<>();

            // Execute nodes in a simplified sequential order (for a real app, use a proper DAG traversal)
            // For simplicity, we'll just execute nodes in the order they appear after the trigger
            // A robust solution needs to follow the 'edges' to determine execution order.
            executeNode(triggerNode, execution, executionContext); // Execute trigger first (might not produce output relevant for next node directly)

            // Iterate through nodes based on edges (simplified)
            JsonNode currentNode = triggerNode;
            while (currentNode != null) {
                String currentNodeId = currentNode.get("id").asText();
                JsonNode nextNode = null;

                for (JsonNode edge : edgesNode) {
                    if (edge.get("source").asText().equals(currentNodeId)) {
                        String nextNodeId = edge.get("target").asText();
                        for (JsonNode node : nodesNode) {
                            if (node.get("id").asText().equals(nextNodeId)) {
                                nextNode = node;
                                break;
                            }
                        }
                        if (nextNode != null) break;
                    }
                }

                if (nextNode != null) {
                    executeNode(nextNode, execution, executionContext);
                    currentNode = nextNode;
                } else {
                    currentNode = null; // No more nodes to execute
                }
            }


            execution.setStatus("COMPLETED");
            execution.setEndTime(LocalDateTime.now());
            workflowExecutionRepository.save(execution);

        } catch (Exception e) {
            execution.setStatus("FAILED");
            execution.setEndTime(LocalDateTime.now());
            // Append error to logsJson for the overall workflow execution
            try {
                JsonNode currentLogs = execution.getLogsJson() != null ? objectMapper.readTree(execution.getLogsJson()) : objectMapper.createArrayNode();
                ((com.fasterxml.jackson.databind.node.ArrayNode) currentLogs).add(objectMapper.createObjectNode()
                        .put("timestamp", LocalDateTime.now().toString())
                        .put("level", "ERROR")
                        .put("message", "Workflow failed: " + e.getMessage()));
                execution.setLogsJson(objectMapper.writeValueAsString(currentLogs));
            } catch (JsonProcessingException ex) {
                System.err.println("Error processing logs: " + ex.getMessage());
            }
            workflowExecutionRepository.save(execution);
            System.err.println("Workflow execution failed for ID " + workflowId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void executeNode(JsonNode nodeDefinition, WorkflowExecution workflowExecution, Map<String, JsonNode> executionContext) throws Exception {
        String nodeId = nodeDefinition.get("id").asText();
        String nodeType = nodeDefinition.get("type").asText();
        JsonNode nodeConfig = nodeDefinition.get("config");

        NodeExecution nodeExecution = new NodeExecution();
        nodeExecution.setExecutionId(workflowExecution.getId());
        nodeExecution.setNodeId(nodeId);
        nodeExecution.setNodeType(nodeType);
        nodeExecution.setStartTime(LocalDateTime.now());
        nodeExecution.setStatus("RUNNING");
        // Store input data - for initial trigger, it might be empty or a fixed event object
        nodeExecution.setInputDataJson(objectMapper.writeValueAsString(executionContext));
        nodeExecutionRepository.save(nodeExecution); // Save to get ID

        String outputData = null;
        String errorMessage = null;
        String status = "SUCCESS";

        try {
            switch (nodeType) {
                case "trigger":
                    // Trigger nodes typically start the flow, their output might be initial event data
                    outputData = objectMapper.writeValueAsString(Map.of("message", "Workflow started by trigger."));
                    break;
                case "httpRequest":
                    // Simulate HTTP Request. In a real app, use RestClient.
                    String url = nodeConfig.get("url").asText();
                    System.out.println("Executing HTTP Request to: " + url);
                    // Actual HTTP call would go here. For example:
                    // String response = restClient.get().uri(url).retrieve().body(String.class);
                    // outputData = response;
                    outputData = objectMapper.writeValueAsString(Map.of("data", "Mock data from " + url));
                    break;
                case "aiAgent":
                    Long aiAgentConfigId = nodeConfig.get("agentId").asLong();
                    String promptTemplate = nodeConfig.get("prompt").asText();

                    // Resolve placeholders in prompt (e.g., {{$node.prevNodeId.data.field}})
                    // This is a simplified example; a full-fledged templating engine (like Handlebars.java) would be needed
                    String actualPrompt = resolvePromptPlaceholders(promptTemplate, executionContext);

                    // Pass along any dynamic AI config parameters from the workflow node itself
                    Map<String, Object> aiCallConfig = new HashMap<>();
                    if (nodeConfig.has("model")) aiCallConfig.put("model", nodeConfig.get("model").asText());
                    if (nodeConfig.has("temperature")) aiCallConfig.put("temperature", nodeConfig.get("temperature").asDouble());
                    if (nodeConfig.has("max_output_tokens")) aiCallConfig.put("maxOutputTokens", nodeConfig.get("max_output_tokens").asInt());


                    System.out.println("Executing AI Agent with prompt: " + actualPrompt);
                    String aiResponse = aiAgentService.executeAiAgent(aiAgentConfigId, actualPrompt, aiCallConfig);
                    outputData = objectMapper.writeValueAsString(Map.of("summary", aiResponse));
                    break;
                case "sendEmail":
                    // Simulate Send Email
                    String to = nodeConfig.get("to").asText();
                    String subject = nodeConfig.get("subject").asText();
                    String bodyTemplate = nodeConfig.get("body").asText();
                    String actualBody = resolvePromptPlaceholders(bodyTemplate, executionContext);
                    System.out.println("Sending email to: " + to + " Subject: " + subject + " Body: " + actualBody);
                    outputData = objectMapper.writeValueAsString(Map.of("status", "Email sent to " + to));
                    break;
                default:
                    throw new IllegalArgumentException("Unknown node type: " + nodeType);
            }
            executionContext.put(nodeId, objectMapper.readTree(outputData));

        } catch (Exception e) {
            status = "FAILED";
            errorMessage = e.getMessage();
            System.err.println("Node " + nodeId + " failed: " + errorMessage);
            e.printStackTrace();
            throw e; // Re-throw to mark overall workflow as failed
        } finally {
            nodeExecution.setEndTime(LocalDateTime.now());
            nodeExecution.setStatus(status);
            nodeExecution.setErrorMessage(errorMessage);
            nodeExecution.setOutputDataJson(outputData);
            nodeExecutionRepository.save(nodeExecution);

            // Update overall workflow execution logs
            WorkflowExecution currentExecution = workflowExecutionRepository.findById(workflowExecution.getId()).orElse(workflowExecution); // Re-fetch to ensure latest
            try {
                JsonNode currentLogs = currentExecution.getLogsJson() != null ? objectMapper.readTree(currentExecution.getLogsJson()) : objectMapper.createArrayNode();
                ((com.fasterxml.jackson.databind.node.ArrayNode) currentLogs).add(objectMapper.createObjectNode()
                        .put("timestamp", LocalDateTime.now().toString())
                        .put("nodeId", nodeId)
                        .put("nodeType", nodeType)
                        .put("status", status)
                        .put("message", errorMessage != null ? errorMessage : "Node completed successfully"));
                currentExecution.setLogsJson(objectMapper.writeValueAsString(currentLogs));
                workflowExecutionRepository.save(currentExecution);
            } catch (JsonProcessingException e) {
                System.err.println("Error updating workflow execution logs: " + e.getMessage());
            }
        }
    }

    /**
     * Very basic placeholder resolver. A real templating engine is needed.
     * Looks for {{$node.NODE_ID.data.FIELD}} or similar.
     */
    private String resolvePromptPlaceholders(String template, Map<String, JsonNode> executionContext) {
        String resolved = template;
        // Example for {{env.VAR}}
        resolved = resolved.replaceAll("\\{\\{env\\.NEWS_API_KEY\\}\\}", "your_news_api_key_from_env_or_vault");

        // Example for {{$node.http_request_1.data.articles}}
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\{\\{\\$node\\.(\\w+)\\.data\\.(\\w+)\\}\\}");
        java.util.regex.Matcher matcher = pattern.matcher(resolved);
        while (matcher.find()) {
            String nodeId = matcher.group(1);
            String field = matcher.group(2);
            if (executionContext.containsKey(nodeId) && executionContext.get(nodeId).has("data") && executionContext.get(nodeId).get("data").has(field)) {
                resolved = resolved.replace(matcher.group(0), executionContext.get(nodeId).get("data").get(field).asText());
            } else {
                System.err.println("Placeholder not resolved: " + matcher.group(0));
            }
        }
        return resolved;
    }

}


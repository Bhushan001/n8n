package com.n8n.ai.core.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.n8n.ai.core.entity.Workflow;
import com.n8n.ai.core.entity.WorkflowExecution;
import com.n8n.ai.core.model.WorkflowExecutionRequest;
import com.n8n.ai.core.repository.WorkflowExecutionRepository;
import com.n8n.ai.core.repository.WorkflowRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowExecutionRepository workflowExecutionRepository;
    private final RabbitTemplate rabbitTemplate; // For sending messages to the queue
    private final ObjectMapper objectMapper; // For JSON parsing


    public List<Workflow> findAllWorkflows() {
        return workflowRepository.findAll();
    }

    public Optional<Workflow> findWorkflowById(Long id) {
        return workflowRepository.findById(id);
    }

    @Transactional
    public Workflow saveWorkflow(Workflow workflow) {
        return workflowRepository.save(workflow);
    }

    @Transactional
    public void deleteWorkflow(Long id) {
        workflowRepository.deleteById(id);
    }

    @Transactional
    public void triggerWorkflowExecution(Long workflowId) throws JsonProcessingException {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found with ID: " + workflowId));

        // Create a new execution record
        WorkflowExecution execution = new WorkflowExecution();
        execution.setWorkflowId(workflow.getId());
        execution.setStartTime(LocalDateTime.now());
        execution.setStatus("QUEUED");
        workflowExecutionRepository.save(execution); // Save to get an ID

        // Send a message to the message queue for asynchronous processing
        // The message should contain enough info for the worker to execute the workflow
        // Example: a DTO containing workflow ID and execution ID
        String message = objectMapper.writeValueAsString(new WorkflowExecutionRequest(workflow.getId(), execution.getId()));
        rabbitTemplate.convertAndSend("workflow-queue", message); // "workflow-queue" is the queue name
    }
}


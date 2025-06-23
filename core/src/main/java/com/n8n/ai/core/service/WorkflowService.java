package com.n8n.ai.core.service;

import com.n8n.ai.core.entity.Workflow;
import com.n8n.ai.core.entity.WorkflowExecution;
import com.n8n.ai.core.model.WorkflowExecutionRequest;
import com.n8n.ai.core.repository.WorkflowExecutionRepository;
import com.n8n.ai.core.repository.WorkflowRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowExecutionRepository executionRepository;

    public WorkflowService(WorkflowRepository workflowRepository, WorkflowExecutionRepository executionRepository) {
        this.workflowRepository = workflowRepository;
        this.executionRepository = executionRepository;
    }

    public List<Workflow> getAllWorkflows() {
        return workflowRepository.findAll();
    }

    public Workflow getWorkflowById(Long id) {
        return workflowRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found with id: " + id));
    }

    @Transactional
    public Workflow createWorkflow(Workflow workflow) {
        workflow.setCreatedAt(LocalDateTime.now());
        workflow.setUpdatedAt(LocalDateTime.now());
        return workflowRepository.save(workflow);
    }

    @Transactional
    public Workflow updateWorkflow(Long id, Workflow workflow) {
        Workflow existingWorkflow = getWorkflowById(id);
        
        if (workflow.getName() != null) {
            existingWorkflow.setName(workflow.getName());
        }
        if (workflow.getDescription() != null) {
            existingWorkflow.setDescription(workflow.getDescription());
        }
        if (workflow.getDefinitionJson() != null) {
            existingWorkflow.setDefinitionJson(workflow.getDefinitionJson());
        }
        existingWorkflow.setActive(workflow.isActive());
        existingWorkflow.setUpdatedAt(LocalDateTime.now());
        
        return workflowRepository.save(existingWorkflow);
    }

    @Transactional
    public void deleteWorkflow(Long id) {
        if (!workflowRepository.existsById(id)) {
            throw new IllegalArgumentException("Workflow not found with id: " + id);
        }
        workflowRepository.deleteById(id);
    }

    @Transactional
    public Workflow duplicateWorkflow(Long id, String newName) {
        Workflow originalWorkflow = getWorkflowById(id);
        Workflow duplicatedWorkflow = new Workflow();
        
        duplicatedWorkflow.setName(newName != null ? newName : originalWorkflow.getName() + " (Copy)");
        duplicatedWorkflow.setDescription(originalWorkflow.getDescription());
        duplicatedWorkflow.setDefinitionJson(originalWorkflow.getDefinitionJson());
        duplicatedWorkflow.setActive(false); // Duplicated workflows start as inactive
        duplicatedWorkflow.setUserId(originalWorkflow.getUserId());
        duplicatedWorkflow.setCreatedAt(LocalDateTime.now());
        duplicatedWorkflow.setUpdatedAt(LocalDateTime.now());
        
        return workflowRepository.save(duplicatedWorkflow);
    }

    @Transactional
    public WorkflowExecution runWorkflow(WorkflowExecutionRequest request) {
        Workflow workflow = getWorkflowById(request.getWorkflowId());
        
        WorkflowExecution execution = new WorkflowExecution();
        execution.setWorkflowId(request.getWorkflowId());
        execution.setStatus("RUNNING");
        execution.setStartedAt(LocalDateTime.now());
        execution.setInput(request.getInput() != null ? request.getInput().toString() : null);
        
        execution = executionRepository.save(execution);
        
        // In a real application, you would:
        // 1. Parse the workflow definition
        // 2. Execute the workflow nodes
        // 3. Update execution status and result
        // 4. Handle errors and timeouts
        
        // For now, we'll simulate a successful execution
        execution.setStatus("COMPLETED");
        execution.setCompletedAt(LocalDateTime.now());
        execution.setResult("{\"message\": \"Workflow executed successfully\"}");
        
        return executionRepository.save(execution);
    }

    public List<WorkflowExecution> getWorkflowExecutions(Long workflowId) {
        return executionRepository.findByWorkflowIdOrderByStartedAtDesc(workflowId);
    }

    public WorkflowExecution getExecutionById(Long executionId) {
        return executionRepository.findById(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Execution not found with id: " + executionId));
    }

    @Transactional
    public void cancelExecution(Long executionId) {
        WorkflowExecution execution = getExecutionById(executionId);
        if ("RUNNING".equals(execution.getStatus())) {
            execution.setStatus("CANCELLED");
            execution.setCompletedAt(LocalDateTime.now());
            executionRepository.save(execution);
        }
    }

    public Map<String, Object> validateWorkflow(Workflow workflow) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new java.util.ArrayList<>();
        
        // Basic validation
        if (workflow.getName() == null || workflow.getName().trim().isEmpty()) {
            errors.add("Workflow name is required");
        }
        
        if (workflow.getDefinitionJson() == null || workflow.getDefinitionJson().trim().isEmpty()) {
            errors.add("Workflow definition is required");
        }
        
        // In a real application, you would:
        // 1. Validate JSON structure
        // 2. Check for required nodes
        // 3. Validate connections
        // 4. Check for circular dependencies
        
        result.put("valid", errors.isEmpty());
        if (!errors.isEmpty()) {
            result.put("errors", errors);
        }
        
        return result;
    }

    public Map<String, Object> exportWorkflow(Long id) {
        Workflow workflow = getWorkflowById(id);
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("workflow", workflow);
        exportData.put("exportData", workflow.getDefinitionJson());
        return exportData;
    }

    @Transactional
    public Workflow importWorkflow(String importData) {
        // In a real application, you would:
        // 1. Validate the import data
        // 2. Parse the workflow definition
        // 3. Create a new workflow
        
        Workflow workflow = new Workflow();
        workflow.setName("Imported Workflow");
        workflow.setDescription("Imported from external source");
        workflow.setDefinitionJson(importData);
        workflow.setActive(false);
        workflow.setCreatedAt(LocalDateTime.now());
        workflow.setUpdatedAt(LocalDateTime.now());
        
        return workflowRepository.save(workflow);
    }

    public List<Workflow> searchWorkflows(String query) {
        // In a real application, you would implement proper search
        // For now, return all workflows
        return workflowRepository.findAll();
    }

    public List<Workflow> getWorkflowsByTag(String tag) {
        // In a real application, you would implement tag-based filtering
        // For now, return all workflows
        return workflowRepository.findAll();
    }

    public Map<String, Object> getWorkflowStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalWorkflows = workflowRepository.count();
        long activeWorkflows = workflowRepository.countByIsActiveTrue();
        long totalExecutions = executionRepository.count();
        long successfulExecutions = executionRepository.countByStatus("COMPLETED");
        long failedExecutions = executionRepository.countByStatus("FAILED");
        
        stats.put("totalWorkflows", totalWorkflows);
        stats.put("activeWorkflows", activeWorkflows);
        stats.put("totalExecutions", totalExecutions);
        stats.put("successfulExecutions", successfulExecutions);
        stats.put("failedExecutions", failedExecutions);
        
        return stats;
    }
}


package com.n8n.ai.core.controller;

import com.n8n.ai.core.entity.Workflow;
import com.n8n.ai.core.entity.WorkflowExecution;
import com.n8n.ai.core.model.WorkflowExecutionRequest;
import com.n8n.ai.core.service.WorkflowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflows")
@CrossOrigin(origins = {"http://localhost:4200", "https://your-production-domain.com"})
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Workflow>> getAllWorkflows() {
        List<Workflow> workflows = workflowService.getAllWorkflows();
        return ResponseEntity.ok(workflows);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Workflow> getWorkflowById(@PathVariable Long id) {
        Workflow workflow = workflowService.getWorkflowById(id);
        return ResponseEntity.ok(workflow);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Workflow> createWorkflow(@Valid @RequestBody Workflow workflow) {
        Workflow createdWorkflow = workflowService.createWorkflow(workflow);
        return new ResponseEntity<>(createdWorkflow, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Workflow> updateWorkflow(@PathVariable Long id, @Valid @RequestBody Workflow workflow) {
        Workflow updatedWorkflow = workflowService.updateWorkflow(id, workflow);
        return ResponseEntity.ok(updatedWorkflow);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Workflow> duplicateWorkflow(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newName = request.get("newName");
        Workflow duplicatedWorkflow = workflowService.duplicateWorkflow(id, newName);
        return ResponseEntity.ok(duplicatedWorkflow);
    }

    @PostMapping("/{id}/run")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<WorkflowExecution> runWorkflow(@PathVariable Long id, @RequestBody WorkflowExecutionRequest request) {
        request.setWorkflowId(id);
        WorkflowExecution execution = workflowService.runWorkflow(request);
        return ResponseEntity.ok(execution);
    }

    @GetMapping("/{id}/executions")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<WorkflowExecution>> getWorkflowExecutions(@PathVariable Long id) {
        List<WorkflowExecution> executions = workflowService.getWorkflowExecutions(id);
        return ResponseEntity.ok(executions);
    }

    @GetMapping("/executions/{executionId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<WorkflowExecution> getExecutionById(@PathVariable Long executionId) {
        WorkflowExecution execution = workflowService.getExecutionById(executionId);
        return ResponseEntity.ok(execution);
    }

    @PostMapping("/executions/{executionId}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> cancelExecution(@PathVariable Long executionId) {
        workflowService.cancelExecution(executionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/validate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> validateWorkflow(@Valid @RequestBody Workflow workflow) {
        Map<String, Object> validationResult = workflowService.validateWorkflow(workflow);
        return ResponseEntity.ok(validationResult);
    }

    @GetMapping("/{id}/export")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> exportWorkflow(@PathVariable Long id) {
        Map<String, Object> exportData = workflowService.exportWorkflow(id);
        return ResponseEntity.ok(exportData);
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Workflow> importWorkflow(@RequestBody Map<String, String> request) {
        String importData = request.get("importData");
        Workflow importedWorkflow = workflowService.importWorkflow(importData);
        return ResponseEntity.ok(importedWorkflow);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Workflow>> searchWorkflows(@RequestParam String q) {
        List<Workflow> workflows = workflowService.searchWorkflows(q);
        return ResponseEntity.ok(workflows);
    }

    @GetMapping("/tag/{tag}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Workflow>> getWorkflowsByTag(@PathVariable String tag) {
        List<Workflow> workflows = workflowService.getWorkflowsByTag(tag);
        return ResponseEntity.ok(workflows);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getWorkflowStats() {
        Map<String, Object> stats = workflowService.getWorkflowStats();
        return ResponseEntity.ok(stats);
    }
}
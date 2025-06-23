package com.n8n.ai.core.controller;

import com.n8n.ai.core.entity.Workflow;
import com.n8n.ai.core.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    @GetMapping
    public List<Workflow> getAllWorkflows() {
        return workflowService.findAllWorkflows();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getWorkflowById(@PathVariable Long id) {
        return workflowService.findWorkflowById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Workflow createWorkflow(@RequestBody Workflow workflow) {
        // In a real app, you'd get userId from authenticated context
        workflow.setUserId(1L); // Placeholder
        return workflowService.saveWorkflow(workflow);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workflow> updateWorkflow(@PathVariable Long id, @RequestBody Workflow workflow) {
        return workflowService.findWorkflowById(id)
                .map(existingWorkflow -> {
                    existingWorkflow.setName(workflow.getName());
                    existingWorkflow.setDescription(workflow.getDescription());
                    existingWorkflow.setDefinitionJson(workflow.getDefinitionJson());
                    existingWorkflow.setActive(workflow.isActive());
                    // Update other fields as necessary
                    return ResponseEntity.ok(workflowService.saveWorkflow(existingWorkflow));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/run")
    public ResponseEntity<String> runWorkflow(@PathVariable Long id) {
        try {
            workflowService.triggerWorkflowExecution(id);
            return ResponseEntity.ok("Workflow execution initiated.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to initiate workflow: " + e.getMessage());
        }
    }
}
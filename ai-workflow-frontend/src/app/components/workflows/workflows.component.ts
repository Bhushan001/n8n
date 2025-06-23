import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
import { WorkflowService, Workflow } from '../../services/workflow.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IconComponent
],
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss']
})
export class WorkflowsComponent implements OnInit {
  workflows: Workflow[] = [];
  isLoading = true;
  searchTerm = '';

  constructor(
    private workflowService: WorkflowService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.isLoading = true;
    this.workflowService.getAllWorkflows().subscribe({
      next: (workflows) => {
        this.workflows = workflows;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading workflows:', error);
        this.isLoading = false;
        // Mock data for demo
        this.workflows = this.getMockWorkflows();
      }
    });
  }

  private getMockWorkflows(): Workflow[] {
    return [
      {
        id: 1,
        name: 'Customer Onboarding',
        description: 'Automated workflow for new customer registration and setup',
        definitionJson: '{}',
        active: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z'
      },
      {
        id: 2,
        name: 'Invoice Processing',
        description: 'AI-powered invoice validation and processing workflow',
        definitionJson: '{}',
        active: false,
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-18T16:20:00Z'
      },
      {
        id: 3,
        name: 'Support Ticket Routing',
        description: 'Intelligent routing of support tickets based on content analysis',
        definitionJson: '{}',
        active: true,
        createdAt: '2024-01-05T11:00:00Z',
        updatedAt: '2024-01-22T13:30:00Z'
      }
    ];
  }

  createNewWorkflow(): void {
    this.router.navigate(['/dashboard']);
  }

  editWorkflow(workflow: Workflow): void {
    this.router.navigate(['/dashboard'], { queryParams: { workflowId: workflow.id } });
  }

  toggleWorkflowStatus(workflow: Workflow): void {
    workflow.active = !workflow.active;
    // Here you would call the API to update the workflow
    console.log(`Workflow ${workflow.name} ${workflow.active ? 'activated' : 'deactivated'}`);
  }

  deleteWorkflow(workflow: Workflow): void {
    if (confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      this.workflows = this.workflows.filter(w => w.id !== workflow.id);
      console.log(`Workflow ${workflow.name} deleted`);
    }
  }

  runWorkflow(workflow: Workflow): void {
    if (workflow.id) {
      this.workflowService.runWorkflow(workflow.id).subscribe({
        next: (result) => {
          console.log('Workflow execution started:', result);
        },
        error: (error) => {
          console.error('Error running workflow:', error);
        }
      });
    }
  }

  get filteredWorkflows(): Workflow[] {
    if (!this.searchTerm) return this.workflows;
    return this.workflows.filter(workflow =>
      workflow.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}

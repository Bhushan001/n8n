import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowCanvasComponent } from '../workflow-canvas/workflow-canvas.component';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    WorkflowCanvasComponent,
    IconComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(WorkflowCanvasComponent) workflowCanvas!: WorkflowCanvasComponent;

  ngOnInit(): void {
    // Listen for new workflow events from sidebar
    window.addEventListener('newWorkflow', this.handleNewWorkflowEvent);
  }

  ngOnDestroy(): void {
    window.removeEventListener('newWorkflow', this.handleNewWorkflowEvent);
  }

  private handleNewWorkflowEvent = (): void => {
    // Small delay to ensure the canvas is ready
    setTimeout(() => {
      this.onNewWorkflow();
    }, 100);
  };

  onNewWorkflow(): void {
    if (this.workflowCanvas) {
      this.workflowCanvas.clearCanvas();
    }
  }

  onSaveWorkflow(): void {
    if (this.workflowCanvas) {
      const workflowDefinition = this.workflowCanvas.saveWorkflow();
      console.log('Saving workflow:', workflowDefinition);
      this.showNotification('Workflow saved successfully!', 'success');
    }
  }

  onExecuteWorkflow(): void {
    if (this.workflowCanvas) {
      const workflowDefinition = this.workflowCanvas.saveWorkflow();
      console.log('Executing workflow:', workflowDefinition);
      this.showNotification('Workflow execution started!', 'info');
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}
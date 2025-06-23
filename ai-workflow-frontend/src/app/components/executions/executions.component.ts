import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';

interface Execution {
  id: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  trigger: string;
}

@Component({
  selector: 'app-executions',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './executions.component.html',
  styleUrls: ['./executions.component.scss']
})
export class ExecutionsComponent implements OnInit {
  executions: Execution[] = [];
  isLoading = true;
  selectedStatus = 'all';

  ngOnInit(): void {
    this.loadExecutions();
  }

  loadExecutions(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.executions = this.getMockExecutions();
      this.isLoading = false;
    }, 1000);
  }

  private getMockExecutions(): Execution[] {
    return [
      {
        id: '1',
        workflowName: 'Customer Onboarding',
        status: 'completed',
        startTime: '2024-01-22T10:30:00Z',
        endTime: '2024-01-22T10:32:15Z',
        duration: 135,
        trigger: 'Manual'
      },
      {
        id: '2',
        workflowName: 'Invoice Processing',
        status: 'running',
        startTime: '2024-01-22T11:15:00Z',
        trigger: 'Webhook'
      },
      {
        id: '3',
        workflowName: 'Support Ticket Routing',
        status: 'failed',
        startTime: '2024-01-22T09:45:00Z',
        endTime: '2024-01-22T09:46:30Z',
        duration: 90,
        trigger: 'Schedule'
      }
    ];
  }

  getStatusColor(status: string): string {
    const colors = {
      'running': 'text-blue-700 bg-blue-100',
      'completed': 'text-green-700 bg-green-100',
      'failed': 'text-red-700 bg-red-100',
      'cancelled': 'text-gray-700 bg-gray-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-700 bg-gray-100';
  }

  getStatusIcon(status: string): string {
    const icons = {
      'running': 'loader',
      'completed': 'check',
      'failed': 'x',
      'cancelled': 'pause'
    };
    return icons[status as keyof typeof icons] || 'help';
  }

  get filteredExecutions(): Execution[] {
    if (this.selectedStatus === 'all') return this.executions;
    return this.executions.filter(exec => exec.status === this.selectedStatus);
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  cancelExecution(execution: Execution): void {
    if (execution.status === 'running') {
      execution.status = 'cancelled';
      execution.endTime = new Date().toISOString();
    }
  }

  retryExecution(execution: Execution): void {
    console.log('Retrying execution:', execution.id);
  }
}

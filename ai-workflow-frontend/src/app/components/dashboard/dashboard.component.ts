import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../shared/icon.component';

interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  executionsToday: number;
  avgExecutionTime: number;
}

interface RecentExecution {
  id: string;
  workflowName: string;
  status: string;
  startedAt: Date;
  duration: number;
  icon: string;
  statusClass: string;
  statusBadgeClass: string;
}

interface RecentWorkflow {
  id: string;
  name: string;
  isActive: boolean;
  updatedAt: Date;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  stats: DashboardStats = {
    totalWorkflows: 0,
    activeWorkflows: 0,
    executionsToday: 0,
    avgExecutionTime: 0
  };
  recentExecutions: RecentExecution[] = [];
  recentWorkflows: RecentWorkflow[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Simulate loading data
    setTimeout(() => {
      this.stats = {
        totalWorkflows: 12,
        activeWorkflows: 8,
        executionsToday: 24,
        avgExecutionTime: 3.2
      };

      this.recentExecutions = [
        {
          id: '1',
          workflowName: 'Email Processing Workflow',
          status: 'Completed',
          startedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          duration: 2.5,
          icon: 'mail',
          statusClass: 'bg-green-500',
          statusBadgeClass: 'bg-green-100 text-green-800'
        },
        {
          id: '2',
          workflowName: 'Data Analysis Pipeline',
          status: 'Running',
          startedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          duration: 1.2,
          icon: 'database',
          statusClass: 'bg-blue-500',
          statusBadgeClass: 'bg-blue-100 text-blue-800'
        },
        {
          id: '3',
          workflowName: 'AI Content Generation',
          status: 'Failed',
          startedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          duration: 0.8,
          icon: 'message-circle',
          statusClass: 'bg-red-500',
          statusBadgeClass: 'bg-red-100 text-red-800'
        }
      ];

      this.recentWorkflows = [
        {
          id: '1',
          name: 'Email Processing Workflow',
          isActive: true,
          updatedAt: new Date(Date.now() - 1000 * 60 * 30),
          icon: 'mail',
          colorClass: 'bg-blue-500'
        },
        {
          id: '2',
          name: 'Data Analysis Pipeline',
          isActive: true,
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          icon: 'database',
          colorClass: 'bg-green-500'
        },
        {
          id: '3',
          name: 'AI Content Generation',
          isActive: false,
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          icon: 'message-circle',
          colorClass: 'bg-purple-500'
        }
      ];

      this.isLoading = false;
    }, 1000);
  }

  createNewWorkflow(): void {
    // Navigate to workflow creation or open workflow editor
    this.router.navigate(['/workflow-editor']);
  }

  navigateToWorkflows(): void {
    this.router.navigate(['/workflows']);
  }

  navigateToExecutions(): void {
    this.router.navigate(['/executions']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
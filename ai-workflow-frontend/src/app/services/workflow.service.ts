import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Workflow {
  id?: number;
  name: string;
  description: string;
  definitionJson: string;
  isActive: boolean;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  tags?: string[];
}

export interface Node {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  config?: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface WorkflowExecution {
  id: number;
  workflowId: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
  executionTime?: number;
}

export interface WorkflowExecutionRequest {
  workflowId: number;
  input?: any;
  parameters?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private readonly API_URL = `${environment.apiUrl}/workflows`;

  constructor(private http: HttpClient) {}

  // Workflow CRUD operations
  getAllWorkflows(): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(this.API_URL)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getWorkflowById(id: number): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.API_URL}/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createWorkflow(workflow: Omit<Workflow, 'id'>): Observable<Workflow> {
    return this.http.post<Workflow>(this.API_URL, workflow)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateWorkflow(id: number, workflow: Partial<Workflow>): Observable<Workflow> {
    return this.http.put<Workflow>(`${this.API_URL}/${id}`, workflow)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteWorkflow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  duplicateWorkflow(id: number, newName?: string): Observable<Workflow> {
    return this.http.post<Workflow>(`${this.API_URL}/${id}/duplicate`, { newName })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Workflow execution
  runWorkflow(executionRequest: WorkflowExecutionRequest): Observable<WorkflowExecution> {
    return this.http.post<WorkflowExecution>(`${this.API_URL}/${executionRequest.workflowId}/run`, executionRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  getWorkflowExecutions(workflowId: number): Observable<WorkflowExecution[]> {
    return this.http.get<WorkflowExecution[]>(`${this.API_URL}/${workflowId}/executions`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getExecutionById(executionId: number): Observable<WorkflowExecution> {
    return this.http.get<WorkflowExecution>(`${this.API_URL}/executions/${executionId}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  cancelExecution(executionId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/executions/${executionId}/cancel`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  // Workflow validation
  validateWorkflow(workflow: Workflow): Observable<{ valid: boolean; errors?: string[] }> {
    return this.http.post<{ valid: boolean; errors?: string[] }>(`${this.API_URL}/validate`, workflow)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Workflow import/export
  exportWorkflow(id: number): Observable<{ workflow: Workflow; exportData: string }> {
    return this.http.get<{ workflow: Workflow; exportData: string }>(`${this.API_URL}/${id}/export`)
      .pipe(
        catchError(this.handleError)
      );
  }

  importWorkflow(importData: string): Observable<Workflow> {
    return this.http.post<Workflow>(`${this.API_URL}/import`, { importData })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Search and filtering
  searchWorkflows(query: string): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(`${this.API_URL}/search`, { params: { q: query } })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getWorkflowsByTag(tag: string): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(`${this.API_URL}/tag/${encodeURIComponent(tag)}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Statistics
  getWorkflowStats(): Observable<{
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
  }> {
    return this.http.get<any>(`${this.API_URL}/stats`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while processing your request';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Authentication required';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Workflow not found';
          break;
        case 409:
          errorMessage = error.error?.message || 'Workflow conflict';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation failed';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = `Server Error: ${error.status}`;
      }
    }
    
    console.error('Workflow Service Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}

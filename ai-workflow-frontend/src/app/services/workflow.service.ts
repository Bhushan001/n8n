import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Workflow {
  id?: number;
  name: string;
  description: string;
  definitionJson: string;
  active: boolean;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Node {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private readonly API_URL = 'http://localhost:9081/api/workflows';

  constructor(private http: HttpClient) {}

  getAllWorkflows(): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(this.API_URL);
  }

  getWorkflowById(id: number): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.API_URL}/${id}`);
  }

  createWorkflow(workflow: Workflow): Observable<Workflow> {
    return this.http.post<Workflow>(this.API_URL, workflow);
  }

  updateWorkflow(id: number, workflow: Workflow): Observable<Workflow> {
    return this.http.put<Workflow>(`${this.API_URL}/${id}`, workflow);
  }

  deleteWorkflow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  runWorkflow(id: number): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/${id}/run`, {});
  }
}

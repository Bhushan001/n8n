import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  colorClass: string;
  statusClass: string;
  x: number;
  y: number;
  inputs: any[];
  outputs: any[];
  configFields: any[];
  parameters?: any;
  enabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  private nodesSubject = new BehaviorSubject<WorkflowNode[]>([]);
  public nodes$ = this.nodesSubject.asObservable();

  constructor() {}

  setNodes(nodes: WorkflowNode[]): void {
    this.nodesSubject.next(nodes);
  }

  getNodes(): WorkflowNode[] {
    return this.nodesSubject.value;
  }

  getNodeById(nodeId: string): WorkflowNode | undefined {
    return this.nodesSubject.value.find(node => node.id === nodeId);
  }

  updateNode(nodeId: string, updates: Partial<WorkflowNode>): void {
    const nodes = this.nodesSubject.value;
    const nodeIndex = nodes.findIndex(node => node.id === nodeId);
    
    if (nodeIndex !== -1) {
      nodes[nodeIndex] = { ...nodes[nodeIndex], ...updates };
      this.nodesSubject.next([...nodes]);
    }
  }

  // Get node configuration fields based on node type
  getNodeConfigFields(nodeType: string): any[] {
    const configFields: { [key: string]: any[] } = {
      trigger: [
        { name: 'mode', type: 'select', label: 'Trigger Mode', options: ['manual', 'scheduled', 'webhook'], required: true },
        { name: 'waitForCompletion', type: 'checkbox', label: 'Wait for Completion', default: true },
        { name: 'timeout', type: 'number', label: 'Timeout (ms)', default: 30000 }
      ],
      action: [
        { name: 'url', type: 'text', label: 'URL', required: true },
        { name: 'method', type: 'select', label: 'HTTP Method', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'GET' },
        { name: 'headers', type: 'json', label: 'Headers', default: {} },
        { name: 'body', type: 'json', label: 'Request Body' },
        { name: 'timeout', type: 'number', label: 'Timeout (ms)', default: 30000 }
      ],
      ai: [
        { name: 'model', type: 'select', label: 'AI Model', options: ['gpt-4', 'gpt-3.5-turbo', 'claude-3'], required: true },
        { name: 'prompt', type: 'textarea', label: 'Prompt', required: true },
        { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 1000 },
        { name: 'temperature', type: 'number', label: 'Temperature', default: 0.7, min: 0, max: 2 }
      ]
    };

    return configFields[nodeType] || [];
  }

  // Get default parameters for a node type
  getDefaultParameters(nodeType: string): any {
    const defaults: { [key: string]: any } = {
      trigger: {
        mode: 'manual',
        waitForCompletion: true,
        timeout: 30000
      },
      action: {
        url: '',
        method: 'GET',
        headers: {},
        body: null,
        timeout: 30000
      },
      ai: {
        model: 'gpt-3.5-turbo',
        prompt: '',
        maxTokens: 1000,
        temperature: 0.7
      }
    };

    return defaults[nodeType] || {};
  }
} 
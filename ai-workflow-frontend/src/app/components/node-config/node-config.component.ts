import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';

interface NodeSettings {
  [key: string]: any;
  // Trigger settings
  webhookUrl?: string;
  method?: string;
  authentication?: string;
  timeout?: number;
  // Action settings
  url?: string;
  headers?: string;
  body?: string;
  // Condition settings
  field?: string;
  operator?: string;
  value?: string;
  caseSensitive?: boolean;
  // AI Agent settings
  model?: string;
  prompt?: string;
  maxTokens?: number;
  temperature?: number;
  systemMessage?: string;
}

interface NodeConfig {
  id: string;
  label: string;
  type: string;
  description: string;
  settings: NodeSettings;
}

interface NodeInput {
  name: string;
  type: string;
  value: any;
  description?: string;
}

interface NodeOutput {
  name: string;
  type: string;
  value: any;
  description?: string;
}

interface PreviousNodeData {
  nodeId: string;
  nodeName: string;
  outputs: NodeOutput[];
}

@Component({
  selector: 'app-node-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent],
  templateUrl: './node-config.component.html',
  styleUrls: ['./node-config.component.scss']
})
export class NodeConfigComponent implements OnInit {
  nodeConfig: NodeConfig = {
    id: '',
    label: '',
    type: '',
    description: '',
    settings: {}
  };
  
  configForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  isTesting = false;
  
  // Panel data
  previousNodeData: PreviousNodeData | null = null;
  nodeInputs: NodeInput[] = [];
  nodeOutputs: NodeOutput[] = [];
  
  // Panel visibility
  showInputPanel = true;
  showOutputPanel = true;
  
  // Test results
  testResults: any = null;
  testError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const nodeId = params['nodeId'];
      const nodeType = params['nodeType'];
      this.loadNodeConfig(nodeId, nodeType);
    });
  }

  private loadNodeConfig(nodeId: string, nodeType: string): void {
    setTimeout(() => {
      this.nodeConfig = this.getMockNodeConfig(nodeId, nodeType);
      this.previousNodeData = this.getMockPreviousNodeData(nodeType);
      this.nodeInputs = this.getNodeInputs(nodeType);
      this.nodeOutputs = this.getNodeOutputs(nodeType);
      this.buildConfigForm();
      this.isLoading = false;
    }, 500);
  }

  private buildConfigForm(): void {
    const formControls: { [key: string]: any } = {
      label: [this.nodeConfig.label, Validators.required]
    };

    const settings = this.nodeConfig.settings;

    // Add form controls based on node type
    switch (this.nodeConfig.type) {
      case 'trigger':
        formControls['webhookUrl'] = [settings['webhookUrl'] || '', Validators.required];
        formControls['method'] = [settings['method'] || 'POST'];
        formControls['authentication'] = [settings['authentication'] || 'none'];
        formControls['timeout'] = [settings['timeout'] || 30, [Validators.min(1), Validators.max(300)]];
        break;
        
      case 'action':
        formControls['url'] = [settings['url'] || '', Validators.required];
        formControls['method'] = [settings['method'] || 'GET'];
        formControls['headers'] = [settings['headers'] || '{}'];
        formControls['body'] = [settings['body'] || ''];
        formControls['timeout'] = [settings['timeout'] || 30, [Validators.min(1), Validators.max(300)]];
        break;
        
      case 'condition':
        formControls['field'] = [settings['field'] || '', Validators.required];
        formControls['operator'] = [settings['operator'] || 'equals'];
        formControls['value'] = [settings['value'] || '', Validators.required];
        formControls['caseSensitive'] = [settings['caseSensitive'] || false];
        break;
        
      case 'ai-agent':
        formControls['model'] = [settings['model'] || 'gpt-3.5-turbo'];
        formControls['prompt'] = [settings['prompt'] || '', Validators.required];
        formControls['maxTokens'] = [settings['maxTokens'] || 1000, [Validators.min(1), Validators.max(4000)]];
        formControls['temperature'] = [settings['temperature'] || 0.7, [Validators.min(0), Validators.max(2)]];
        formControls['systemMessage'] = [settings['systemMessage'] || ''];
        break;
    }

    this.configForm = this.fb.group(formControls);
  }

  private getMockNodeConfig(nodeId: string, nodeType: string): NodeConfig {
    const configs: { [key: string]: Partial<NodeConfig> } = {
      'trigger': {
        label: 'Webhook Trigger',
        description: 'Triggers the workflow when a webhook is received',
        settings: {
          webhookUrl: 'https://api.example.com/webhook',
          method: 'POST',
          authentication: 'none',
          timeout: 30
        }
      },
      'action': {
        label: 'HTTP Request',
        description: 'Makes an HTTP request to an external API',
        settings: {
          url: 'https://api.example.com/data',
          method: 'GET',
          headers: '{"Content-Type": "application/json"}',
          body: '',
          timeout: 30
        }
      },
      'condition': {
        label: 'Data Filter',
        description: 'Filters data based on specified conditions',
        settings: {
          field: 'status',
          operator: 'equals',
          value: 'active',
          caseSensitive: false
        }
      },
      'ai-agent': {
        label: 'AI Text Processor',
        description: 'Processes text using AI models',
        settings: {
          model: 'gpt-3.5-turbo',
          prompt: 'Analyze the following text and extract key insights:',
          maxTokens: 1000,
          temperature: 0.7,
          systemMessage: 'You are a helpful AI assistant that analyzes text data.'
        }
      }
    };

    return {
      id: nodeId,
      type: nodeType,
      ...configs[nodeType],
      settings: configs[nodeType]?.settings || {}
    } as NodeConfig;
  }

  private getMockPreviousNodeData(nodeType: string): PreviousNodeData | null {
    if (nodeType === 'trigger') return null; // Triggers don't have previous nodes
    
    const mockData: { [key: string]: PreviousNodeData } = {
      'action': {
        nodeId: 'prev-1',
        nodeName: 'Webhook Trigger',
        outputs: [
          { name: 'body', type: 'object', value: { userId: 123, action: 'login', timestamp: '2024-01-22T10:30:00Z' }, description: 'Request body data' },
          { name: 'headers', type: 'object', value: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0' }, description: 'Request headers' },
          { name: 'method', type: 'string', value: 'POST', description: 'HTTP method' },
          { name: 'url', type: 'string', value: '/api/webhook', description: 'Request URL' }
        ]
      },
      'condition': {
        nodeId: 'prev-2',
        nodeName: 'HTTP Request',
        outputs: [
          { name: 'statusCode', type: 'number', value: 200, description: 'HTTP status code' },
          { name: 'data', type: 'object', value: { user: { id: 123, name: 'John Doe', status: 'active' }, success: true }, description: 'Response data' },
          { name: 'headers', type: 'object', value: { 'content-type': 'application/json' }, description: 'Response headers' }
        ]
      },
      'ai-agent': {
        nodeId: 'prev-3',
        nodeName: 'Data Filter',
        outputs: [
          { name: 'filteredData', type: 'object', value: { user: { id: 123, name: 'John Doe', status: 'active' } }, description: 'Filtered user data' },
          { name: 'matchCount', type: 'number', value: 1, description: 'Number of matching records' },
          { name: 'passed', type: 'boolean', value: true, description: 'Whether condition passed' }
        ]
      }
    };

    return mockData[nodeType] || null;
  }

  private getNodeInputs(nodeType: string): NodeInput[] {
    const inputs: { [key: string]: NodeInput[] } = {
      'trigger': [], // Triggers don't have inputs
      'action': [
        { name: 'triggerData', type: 'object', value: null, description: 'Data from previous node' }
      ],
      'condition': [
        { name: 'inputData', type: 'object', value: null, description: 'Data to filter' }
      ],
      'ai-agent': [
        { name: 'textData', type: 'string', value: null, description: 'Text to process' },
        { name: 'context', type: 'object', value: null, description: 'Additional context' }
      ]
    };

    return inputs[nodeType] || [];
  }

  private getNodeOutputs(nodeType: string): NodeOutput[] {
    const outputs: { [key: string]: NodeOutput[] } = {
      'trigger': [
        { name: 'body', type: 'object', value: null, description: 'Webhook request body' },
        { name: 'headers', type: 'object', value: null, description: 'Request headers' },
        { name: 'method', type: 'string', value: null, description: 'HTTP method' },
        { name: 'timestamp', type: 'string', value: null, description: 'Trigger timestamp' }
      ],
      'action': [
        { name: 'statusCode', type: 'number', value: null, description: 'HTTP response status' },
        { name: 'data', type: 'object', value: null, description: 'Response data' },
        { name: 'headers', type: 'object', value: null, description: 'Response headers' },
        { name: 'duration', type: 'number', value: null, description: 'Request duration in ms' }
      ],
      'condition': [
        { name: 'result', type: 'boolean', value: null, description: 'Condition result' },
        { name: 'matchedData', type: 'object', value: null, description: 'Data that matched condition' },
        { name: 'matchCount', type: 'number', value: null, description: 'Number of matches' }
      ],
      'ai-agent': [
        { name: 'response', type: 'string', value: null, description: 'AI generated response' },
        { name: 'tokensUsed', type: 'number', value: null, description: 'Tokens consumed' },
        { name: 'confidence', type: 'number', value: null, description: 'Response confidence score' },
        { name: 'metadata', type: 'object', value: null, description: 'Additional metadata' }
      ]
    };

    return outputs[nodeType] || [];
  }

  onSave(): void {
    if (this.configForm.valid) {
      this.isSaving = true;
      
      // Update node config with form values
      this.nodeConfig.label = this.configForm.value.label;
      this.nodeConfig.settings = { ...this.configForm.value };
      delete this.nodeConfig.settings['label']; // Remove label from settings
      
      setTimeout(() => {
        console.log('Saving node config:', this.nodeConfig);
        this.isSaving = false;
        this.showNotification('Node configuration saved successfully!', 'success');
      }, 1000);
    } else {
      this.showNotification('Please fill in all required fields', 'error');
    }
  }

  onTest(): void {
    if (!this.configForm.valid) {
      this.showNotification('Please fill in all required fields before testing', 'error');
      return;
    }

    this.isTesting = true;
    this.testError = null;
    
    setTimeout(() => {
      // Simulate test execution
      try {
        this.testResults = this.generateMockTestResults();
        this.updateOutputsWithTestResults();
        this.isTesting = false;
        this.showNotification('Test completed successfully!', 'success');
      } catch (error) {
        this.testError = 'Test failed: Invalid configuration';
        this.isTesting = false;
        this.showNotification('Test failed', 'error');
      }
    }, 2000);
  }

  private generateMockTestResults(): any {
    const nodeType = this.nodeConfig.type;
    const mockResults: { [key: string]: any } = {
      'trigger': {
        body: { userId: 123, action: 'test', timestamp: new Date().toISOString() },
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        timestamp: new Date().toISOString()
      },
      'action': {
        statusCode: 200,
        data: { success: true, message: 'Request completed', id: 456 },
        headers: { 'content-type': 'application/json' },
        duration: 245
      },
      'condition': {
        result: true,
        matchedData: { user: { id: 123, status: 'active' } },
        matchCount: 1
      },
      'ai-agent': {
        response: 'Based on the analysis, the key insights are: 1) User engagement is high, 2) Performance metrics are within normal range, 3) No anomalies detected.',
        tokensUsed: 156,
        confidence: 0.92,
        metadata: { model: 'gpt-3.5-turbo', processingTime: 1.2 }
      }
    };

    return mockResults[nodeType] || {};
  }

  private updateOutputsWithTestResults(): void {
    if (this.testResults) {
      this.nodeOutputs.forEach(output => {
        if (this.testResults.hasOwnProperty(output.name)) {
          output.value = this.testResults[output.name];
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleInputPanel(): void {
    this.showInputPanel = !this.showInputPanel;
  }

  toggleOutputPanel(): void {
    this.showOutputPanel = !this.showOutputPanel;
  }

  getFieldError(fieldName: string): string {
    const field = this.configForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.formatFieldName(fieldName)} is required`;
      }
      if (field.errors['min']) {
        return `${this.formatFieldName(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.formatFieldName(fieldName)} must be at most ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.configForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  private formatFieldName(fieldName: string): string {
    return fieldName.replace(/([A-Z])/g, ' $1')
                   .replace(/^./, str => str.toUpperCase())
                   .trim();
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  getValueTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'string': 'text-green-600',
      'number': 'text-blue-600',
      'boolean': 'text-purple-600',
      'object': 'text-orange-600'
    };
    return classes[type] || 'text-gray-600';
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
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 10);
    
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
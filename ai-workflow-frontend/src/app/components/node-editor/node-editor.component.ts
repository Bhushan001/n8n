import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NodeService, WorkflowNode } from '../../services/node.service';

@Component({
  selector: 'app-node-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './node-editor.component.html',
  styleUrls: ['./node-editor.component.scss']
})
export class NodeEditorComponent implements OnInit {
  nodeId: string = '';
  node: WorkflowNode | null = null;
  isSidebarCollapsed = false;
  configForm: FormGroup;
  testResult: any = null;
  inputData: any = null;
  isLoading = false;
  configFields: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private nodeService: NodeService
  ) {
    this.configForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      enabled: [true],
      // Dynamic fields will be added based on node type
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.nodeId = params['id'];
      this.loadNodeData();
    });
  }

  private loadNodeData() {
    // Load actual node data from the service
    const foundNode = this.nodeService.getNodeById(this.nodeId);
    
    if (!foundNode) {
      console.error('Node not found:', this.nodeId);
      // Redirect back to workflow editor if node not found
      this.router.navigate(['/workflow-editor']);
      return;
    }

    this.node = foundNode;

    // Get configuration fields for this node type
    this.configFields = this.nodeService.getNodeConfigFields(this.node.type);

    // Update form with node data
    this.configForm.patchValue({
      name: this.node.name,
      description: this.node.description,
      enabled: this.node.enabled
    });

    // Add dynamic fields based on node type and existing parameters
    this.addDynamicFields();
  }

  private addDynamicFields() {
    if (!this.node) return;

    // Clear existing dynamic fields
    const baseFields = ['name', 'description', 'enabled'];
    Object.keys(this.configForm.controls).forEach(key => {
      if (!baseFields.includes(key)) {
        this.configForm.removeControl(key);
      }
    });

    // Add fields based on node type
    this.configFields.forEach(field => {
      const value = this.node?.parameters?.[field.name] ?? field.default;
      
      if (field.type === 'select') {
        this.configForm.addControl(field.name, this.fb.control(value, field.required ? Validators.required : []));
      } else if (field.type === 'checkbox') {
        this.configForm.addControl(field.name, this.fb.control(value));
      } else if (field.type === 'number') {
        this.configForm.addControl(field.name, this.fb.control(value, field.required ? Validators.required : []));
      } else if (field.type === 'textarea') {
        this.configForm.addControl(field.name, this.fb.control(value, field.required ? Validators.required : []));
      } else if (field.type === 'json') {
        this.configForm.addControl(field.name, this.fb.control(value, field.required ? Validators.required : []));
      } else {
        // Default to text input
        this.configForm.addControl(field.name, this.fb.control(value, field.required ? Validators.required : []));
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  goBack() {
    this.router.navigate(['/workflow-editor']);
  }

  saveNode() {
    if (this.configForm.valid && this.node) {
      const formData = this.configForm.value;
      console.log('Saving node configuration:', formData);
      
      // Update node data
      const updates: Partial<WorkflowNode> = {
        name: formData.name,
        description: formData.description,
        enabled: formData.enabled,
        parameters: {}
      };

      // Add dynamic parameters
      this.configFields.forEach(field => {
        if (formData[field.name] !== undefined) {
          updates.parameters![field.name] = formData[field.name];
        }
      });

      // Update node in service
      this.nodeService.updateNode(this.node.id, updates);
      
      // Update local node data
      this.node = { ...this.node, ...updates };
      
      // Show success message
      alert('Node configuration saved successfully!');
    }
  }

  runTest() {
    this.isLoading = true;
    
    // Simulate test execution based on node type
    setTimeout(() => {
      if (this.node?.type === 'action') {
        // Simulate HTTP request
        this.testResult = {
          success: true,
          data: {
            message: 'HTTP request executed successfully',
            timestamp: new Date().toISOString(),
            output: {
              statusCode: 200,
              headers: { 'content-type': 'application/json' },
              body: { message: 'Success', data: 'Response from API' }
            }
          }
        };
      } else if (this.node?.type === 'ai') {
        // Simulate AI response
        this.testResult = {
          success: true,
          data: {
            message: 'AI request completed successfully',
            timestamp: new Date().toISOString(),
            output: {
              model: this.node?.parameters?.model || 'gpt-3.5-turbo',
              response: 'This is a simulated AI response based on your prompt.',
              tokens: 25
            }
          }
        };
      } else {
        // Default trigger response
        this.testResult = {
          success: true,
          data: {
            message: 'Trigger executed successfully',
            timestamp: new Date().toISOString(),
            output: {
              items: [
                { id: 1, name: 'Trigger Event', value: 'manual_trigger' },
                { id: 2, name: 'Timestamp', value: new Date().toISOString() }
              ]
            }
          }
        };
      }
      
      // Generate sample input data
      this.inputData = {
        items: [
          { id: 1, name: 'Input Event', value: 'workflow_started' },
          { id: 2, name: 'Source', value: 'manual' }
        ]
      };
      
      this.isLoading = false;
    }, 2000);
  }

  getNodeIcon() {
    const icons: { [key: string]: string } = {
      trigger: 'play',
      action: 'settings',
      ai: 'brain',
      condition: 'git-branch',
      transform: 'repeat'
    };
    return this.node?.type ? icons[this.node.type] || 'circle' : 'circle';
  }

  // Helper method to get field type for template
  getFieldType(field: any): string {
    return field.type || 'text';
  }

  // Helper method to check if field is required
  isFieldRequired(field: any): boolean {
    return field.required || false;
  }
}

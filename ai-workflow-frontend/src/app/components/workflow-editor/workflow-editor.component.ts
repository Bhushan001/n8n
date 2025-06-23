import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { Router } from '@angular/router';
import { NodeService, WorkflowNode } from '../../services/node.service';
import { ActivatedRoute } from '@angular/router';

interface NodeTemplate {
  name: string;
  type: string;
  description: string;
  icon: string;
  colorClass: string;
  category: string;
}

@Component({
  selector: 'app-workflow-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './workflow-editor.component.html'
})
export class WorkflowEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasContainer', { static: false }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('connectionSvg', { static: false }) connectionSvgRef!: ElementRef<SVGElement>;

  scale = 1;
  selectedNode: WorkflowNode | null = null;
  workflowNodes: WorkflowNode[] = [];
  connections: any[] = [];
  isDragging = false;
  dragStart = { x: 0, y: 0 };
  isRenaming = false;
  renamingNodeId: string | null = null;
  tempNodeName = '';
  showContextMenu = false;
  contextMenuPosition = { x: 0, y: 0 };
  
  isConnecting = false;
  connectionStart: { nodeId: string; portIndex: number; x: number; y: number } | null = null;
  connectionPreview: { x: number; y: number } | null = null;
  hoveredPort: { nodeId: string; portIndex: number; isInput: boolean } | null = null;
  
  contextMenuItems = [
    { label: 'Configure', icon: 'settings', action: 'configure' },
    { label: 'Rename', icon: 'edit', action: 'rename' },
    { label: 'Delete', icon: 'trash', action: 'delete' },
  ];

  triggerNodes: NodeTemplate[] = [
    {
      name: 'Manual Trigger',
      type: 'trigger',
      description: 'Trigger workflow manually',
      icon: 'play',
      colorClass: 'bg-green-500',
      category: 'trigger'
    },
    {
      name: 'Webhook',
      type: 'trigger',
      description: 'Trigger workflow via HTTP webhook',
      icon: 'webhook',
      colorClass: 'bg-blue-500',
      category: 'trigger'
    },
    {
      name: 'Schedule',
      type: 'trigger',
      description: 'Trigger workflow on schedule',
      icon: 'clock',
      colorClass: 'bg-yellow-500',
      category: 'trigger'
    },
    {
      name: 'File Watch',
      type: 'trigger',
      description: 'Trigger when files change',
      icon: 'folder',
      colorClass: 'bg-orange-500',
      category: 'trigger'
    }
  ];

  actionNodes: NodeTemplate[] = [
    {
      name: 'HTTP Request',
      type: 'action',
      description: 'Make HTTP requests',
      icon: 'globe',
      colorClass: 'bg-indigo-500',
      category: 'action'
    },
    {
      name: 'Database',
      type: 'action',
      description: 'Database operations',
      icon: 'database',
      colorClass: 'bg-purple-500',
      category: 'action'
    },
    {
      name: 'Email',
      type: 'action',
      description: 'Send emails',
      icon: 'mail',
      colorClass: 'bg-red-500',
      category: 'action'
    },
    {
      name: 'File Operation',
      type: 'action',
      description: 'File system operations',
      icon: 'file',
      colorClass: 'bg-orange-500',
      category: 'action'
    }
  ];

  aiNodes: NodeTemplate[] = [
    {
      name: 'AI Chat',
      type: 'ai',
      description: 'AI chat completion',
      icon: 'message-circle',
      colorClass: 'bg-purple-600',
      category: 'ai'
    },
    {
      name: 'Image Generation',
      type: 'ai',
      description: 'Generate images with AI',
      icon: 'image',
      colorClass: 'bg-pink-500',
      category: 'ai'
    },
    {
      name: 'Text Analysis',
      type: 'ai',
      description: 'Analyze text content',
      icon: 'file-text',
      colorClass: 'bg-teal-500',
      category: 'ai'
    }
  ];

  constructor(private router: Router, private nodeService: NodeService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.initializeWorkflow();
  }

  ngAfterViewInit(): void {
    this.drawConnections();
    // Refresh workflow data after view init to catch any updates
    setTimeout(() => this.refreshWorkflow(), 100);
  }

  // Method to refresh workflow data from service
  refreshWorkflow(): void {
    const existingNodes = this.nodeService.getNodes();
    if (existingNodes.length > 0) {
      this.workflowNodes = existingNodes;
      setTimeout(() => this.drawConnections(), 0);
    }
  }

  private initializeWorkflow(): void {
    // Check if there are existing nodes in the service
    const existingNodes = this.nodeService.getNodes();
    if (existingNodes.length > 0) {
      // Load existing workflow
      this.workflowNodes = existingNodes;
    } else {
      // Start with new workflow
      this.newWorkflow();
    }
  }

  newWorkflow(): void {
    this.workflowNodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.isConnecting = false;
    this.scale = 1;
    // Update the service with the new workflow data
    this.nodeService.setNodes(this.workflowNodes);
    setTimeout(() => this.drawConnections(), 0);
  }

  private drawConnections(): void {
    const svg = this.connectionSvgRef?.nativeElement;
    if (!svg) return;
    
    svg.innerHTML = '';
    
    this.connections.forEach(connection => {
      const fromPos = this.getNodePortPosition(connection.fromNodeId, connection.fromPortIndex, false);
      const toPos = this.getNodePortPosition(connection.toNodeId, connection.toPortIndex, true);
      
      if (fromPos && toPos) {
        this.drawConnectionLine(svg, fromPos, toPos, false, connection.id);
      }
    });
    
    if (this.isConnecting && this.connectionStart && this.connectionPreview) {
      this.drawConnectionLine(svg, this.connectionStart, this.connectionPreview, true);
    }
  }

  private drawConnectionLine(svg: SVGElement, from: { x: number; y: number }, to: { x: number; y: number }, isPreview: boolean, connectionId?: string): void {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    const dx = to.x - from.x;
    const cpx1 = from.x + Math.abs(dx) * 0.6;
    const cpy1 = from.y;
    const cpx2 = to.x - Math.abs(dx) * 0.6;
    const cpy2 = to.y;
    
    const pathData = `M ${from.x} ${from.y} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${to.x} ${to.y}`;
    path.setAttribute('d', pathData);
    
    if (isPreview) {
      path.setAttribute('stroke', '#3b82f6');
      path.setAttribute('stroke-width', '4');
      path.setAttribute('stroke-dasharray', '8,4');
    } else {
      path.setAttribute('stroke', '#1f2937');
      path.setAttribute('stroke-width', '3');
      path.setAttribute('pointer-events', 'all');
      path.setAttribute('cursor', 'pointer');
      path.classList.add('connection-line');
      
      path.addEventListener('mouseenter', () => path.setAttribute('stroke', '#3b82f6'));
      path.addEventListener('mouseleave', () => path.setAttribute('stroke', '#1f2937'));
      path.addEventListener('click', (event) => {
        event.stopPropagation();
        if (connectionId && confirm('Delete this connection?')) {
          this.deleteConnection(connectionId);
        }
      });
    }
    
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
  }

  onNodeDragStart(event: DragEvent, node: NodeTemplate): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(node));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const nodeTemplate = JSON.parse(event.dataTransfer?.getData('application/json') || '{}');
    
    if (nodeTemplate.name) {
      const rect = this.containerRef.nativeElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / this.scale;
      const y = (event.clientY - rect.top) / this.scale;
      
      const newNode: WorkflowNode = {
        id: Date.now().toString(),
        name: nodeTemplate.name,
        type: nodeTemplate.type,
        description: nodeTemplate.description,
        icon: nodeTemplate.icon,
        colorClass: nodeTemplate.colorClass,
        statusClass: 'bg-gray-200',
        x: x - 75, // Center the node
        y: y - 25,
        inputs: nodeTemplate.type === 'trigger' ? [] : [{ type: 'data' }], // Trigger nodes have no inputs, others have 1 input
        outputs: [{ type: 'data' }], // All nodes have 1 output
        configFields: this.nodeService.getNodeConfigFields(nodeTemplate.type),
        parameters: this.nodeService.getDefaultParameters(nodeTemplate.type),
        enabled: true
      };
      
      this.workflowNodes.push(newNode);
      this.drawConnections();
    }
  }

  onNodeMouseDown(event: MouseEvent, node: WorkflowNode): void {
    this.isDragging = true;
    this.selectNode(node);
    
    const containerRect = this.containerRef.nativeElement.getBoundingClientRect();
    this.dragStart = { 
      x: (event.clientX - containerRect.left) / this.scale - node.x, 
      y: (event.clientY - containerRect.top) / this.scale - node.y 
    };
    
    event.stopPropagation();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.selectedNode) {
      const containerRect = this.containerRef.nativeElement.getBoundingClientRect();
      this.selectedNode.x = (event.clientX - containerRect.left) / this.scale - this.dragStart.x;
      this.selectedNode.y = (event.clientY - containerRect.top) / this.scale - this.dragStart.y;
      this.drawConnections();
    }
    
    if (this.isConnecting && this.connectionStart) {
      const rect = this.containerRef.nativeElement.getBoundingClientRect();
      this.connectionPreview = { 
        x: (event.clientX - rect.left) / this.scale, 
        y: (event.clientY - rect.top) / this.scale 
      };
      this.drawConnections();
    }
  }

  @HostListener('mouseup')
  onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.drawConnections();
    }
    if (this.isConnecting) {
      if (this.hoveredPort && this.hoveredPort.isInput) {
        this.createConnection(this.connectionStart!.nodeId, this.connectionStart!.portIndex, this.hoveredPort.nodeId, this.hoveredPort.portIndex);
      }
      this.isConnecting = false;
      this.connectionStart = null;
      this.connectionPreview = null;
      this.hoveredPort = null;
      this.drawConnections();
    }
  }

  @HostListener('keydown.escape')
  onEscapeKey(): void {
    if (this.isConnecting) {
      this.isConnecting = false;
      this.drawConnections();
    }
  }

  selectNode(node: WorkflowNode): void {
    this.selectedNode = node;
  }

  deselectNode(): void {
    this.selectedNode = null;
    this.closeContextMenu();
  }

  zoomIn(): void {
    this.scale = Math.min(this.scale * 1.2, 2);
    this.drawConnections();
  }

  zoomOut(): void {
    this.scale = Math.max(this.scale / 1.2, 0.2);
    this.drawConnections();
  }

  fitToScreen(): void {
    this.scale = 1;
    this.drawConnections();
  }

  deleteNode(): void {
    if (this.selectedNode) {
      this.connections = this.connections.filter(c => c.fromNodeId !== this.selectedNode!.id && c.toNodeId !== this.selectedNode!.id);
      this.workflowNodes = this.workflowNodes.filter(n => n.id !== this.selectedNode!.id);
      this.selectedNode = null;
      this.drawConnections();
    }
  }

  onPortMouseDown(event: MouseEvent, nodeId: string, portIndex: number, isInput: boolean): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (isInput) return;
    
    const portPosition = this.getNodePortPosition(nodeId, portIndex, isInput);
    if (!portPosition) return;
    
    this.isConnecting = true;
    this.connectionStart = { nodeId, portIndex, x: portPosition.x, y: portPosition.y };
    this.connectionPreview = { x: portPosition.x, y: portPosition.y };
    this.drawConnections();
  }

  onPortMouseEnter(event: MouseEvent, nodeId: string, portIndex: number, isInput: boolean): void {
    if (this.isConnecting && isInput) {
      this.hoveredPort = { nodeId, portIndex, isInput };
    }
  }

  onPortMouseLeave(event: MouseEvent): void {
    if (this.isConnecting) {
      this.hoveredPort = null;
    }
  }

  private createConnection(fromNodeId: string, fromPortIndex: number, toNodeId: string, toPortIndex: number): void {
    const isAlreadyConnected = this.connections.some(
      c => c.toNodeId === toNodeId && c.toPortIndex === toPortIndex
    );

    if (isAlreadyConnected) {
      console.warn('Input port already has a connection.');
      return;
    }
    
    const newConnection = { id: `conn_${Date.now()}`, fromNodeId, fromPortIndex, toNodeId, toPortIndex };
    this.connections.push(newConnection);
    setTimeout(() => this.drawConnections(), 0);
  }

  deleteConnection(connectionId: string): void {
    this.connections = this.connections.filter(conn => conn.id !== connectionId);
    this.drawConnections();
  }

  private getNodePortPosition(nodeId: string, portIndex: number, isInput: boolean): { x: number; y: number } | null {
    const node = this.workflowNodes.find(n => n.id === nodeId);
    if (!node) return null;

    const nodeWidth = 180;
    const nodeHeight = 120;
    const portHandleOffset = 12;

    const portY = node.y + nodeHeight / 2;

    let portX: number;
    if (isInput) {
      portX = node.x - portHandleOffset;
    } else {
      portX = node.x + nodeWidth + portHandleOffset;
    }

    return { x: portX, y: portY };
  }

  getConnectionStats(): { total: number; valid: number; invalid: number } {
    return { total: this.connections.length, valid: 0, invalid: 0 };
  }

  onNodeContextMenu(event: MouseEvent, node: WorkflowNode): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectNode(node);
    this.showContextMenu = true;
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    this.contextMenuPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  closeContextMenu(): void {
    this.showContextMenu = false;
  }

  onContextMenuItemClick(action: string): void {
    if (!this.selectedNode) return;

    switch (action) {
      case 'configure':
        this.configureNode();
        break;
      case 'rename':
        this.startRename();
        break;
      case 'delete':
        this.deleteNode();
        break;
    }
    this.closeContextMenu();
  }
  
  private configureNode(): void {
    if(this.selectedNode) {
      console.log('Configure node:', this.selectedNode);
      this.router.navigate(['/node', this.selectedNode.id]);
    }
  }
  
  private startRename(): void {
    if (this.selectedNode) {
      this.isRenaming = true;
      this.renamingNodeId = this.selectedNode.id;
      this.tempNodeName = this.selectedNode.name;
      this.closeContextMenu();
    }
  }
  
  onRenameKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.finishRename();
    } else if (event.key === 'Escape') {
      this.cancelRename();
    }
  }

  onRenameBlur(): void {
    this.finishRename();
  }

  private finishRename(): void {
    if (this.renamingNodeId) {
        const node = this.workflowNodes.find(n => n.id === this.renamingNodeId);
        if (node) {
            node.name = this.tempNodeName;
        }
    }
    this.cancelRename();
  }

  private cancelRename(): void {
    this.isRenaming = false;
    this.renamingNodeId = null;
    this.tempNodeName = '';
  }

  saveNode(): void {
    if (this.selectedNode) {
      this.nodeService.updateNode(this.selectedNode.id, this.selectedNode);
    }
  }
} 
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Node, Edge } from '../../services/workflow.service';
import { IconComponent } from '../shared/icon.component';
import { ContextMenuComponent, ContextMenuItem } from '../shared/context-menu.component';

interface CanvasNode extends Node {
  selected: boolean;
  width: number;
  height: number;
}

interface CanvasEdge extends Edge {
  selected: boolean;
}

interface ConnectionPoint {
  nodeId: string;
  type: 'input' | 'output';
  x: number;
  y: number;
}

@Component({
  selector: 'app-workflow-canvas',
  standalone: true,
  imports: [CommonModule, IconComponent, ContextMenuComponent, FormsModule],
  templateUrl: './workflow-canvas.component.html',
  styleUrls: ['./workflow-canvas.component.scss']
})
export class WorkflowCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private ctx!: CanvasRenderingContext2D;
  nodes: CanvasNode[] = [];
  private edges: CanvasEdge[] = [];
  private isDragging = false;
  private dragNode: CanvasNode | null = null;
  private dragOffset = { x: 0, y: 0 };
  scale = 1;
  private panOffset = { x: 0, y: 0 };
  private isPanning = false;
  private lastPanPoint = { x: 0, y: 0 };
  private resizeObserver?: ResizeObserver;
  private currentWorkflowId: string | null = null;
  private hasUnsavedChanges = false;

  // Connection functionality
  private isConnecting = false;
  private connectionStart: ConnectionPoint | null = null;
  private connectionEnd: ConnectionPoint | null = null;
  private tempConnectionEnd = { x: 0, y: 0 };

  // Context menu properties
  showContextMenu = false;
  contextMenuPosition = { x: 0, y: 0 };
  contextMenuItems: ContextMenuItem[] = [];
  selectedNodeForContext: CanvasNode | null = null;
  isRenaming = false;
  renamingNodeId: string | null = null;
  tempNodeName = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeSampleWorkflow();
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.setupEventListeners();
    this.setupResizeObserver();
    this.draw();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    window.removeEventListener('resize', this.onWindowResize);
  }

  // Connection methods
  private getConnectionPointAt(x: number, y: number): ConnectionPoint | null {
    for (const node of this.nodes) {
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const { width, height } = node;
      
      // Check input connection point (left side)
      const inputX = nodeX;
      const inputY = nodeY + height / 2;
      if (Math.abs(x - inputX) <= 10 && Math.abs(y - inputY) <= 10) {
        return {
          nodeId: node.id,
          type: 'input',
          x: inputX,
          y: inputY
        };
      }
      
      // Check output connection point (right side)
      const outputX = nodeX + width;
      const outputY = nodeY + height / 2;
      if (Math.abs(x - outputX) <= 10 && Math.abs(y - outputY) <= 10) {
        return {
          nodeId: node.id,
          type: 'output',
          x: outputX,
          y: outputY
        };
      }
    }
    return null;
  }

  private startConnection(connectionPoint: ConnectionPoint): void {
    this.isConnecting = true;
    this.connectionStart = connectionPoint;
    this.connectionEnd = null;
  }

  private finishConnection(connectionPoint: ConnectionPoint): void {
    if (!this.connectionStart) return;
    
    // Validate connection
    if (this.connectionStart.nodeId === connectionPoint.nodeId) {
      // Can't connect to same node
      this.cancelConnection();
      return;
    }
    
    if (this.connectionStart.type === connectionPoint.type) {
      // Can't connect same types (input to input, output to output)
      this.cancelConnection();
      return;
    }
    
    // Determine source and target
    let sourceNodeId: string;
    let targetNodeId: string;
    
    if (this.connectionStart.type === 'output') {
      sourceNodeId = this.connectionStart.nodeId;
      targetNodeId = connectionPoint.nodeId;
    } else {
      sourceNodeId = connectionPoint.nodeId;
      targetNodeId = this.connectionStart.nodeId;
    }
    
    // Check if connection already exists
    const existingEdge = this.edges.find(edge => 
      edge.source === sourceNodeId && edge.target === targetNodeId
    );
    
    if (existingEdge) {
      this.cancelConnection();
      return;
    }
    
    // Create new edge
    const newEdge: CanvasEdge = {
      id: `edge-${Date.now()}`,
      source: sourceNodeId,
      target: targetNodeId,
      selected: false
    };
    
    this.edges.push(newEdge);
    this.markAsChanged();
    this.cancelConnection();
    this.draw();
  }

  private cancelConnection(): void {
    this.isConnecting = false;
    this.connectionStart = null;
    this.connectionEnd = null;
    this.draw();
  }

  // Context menu methods
  private showNodeContextMenu(node: CanvasNode, x: number, y: number): void {
    this.selectedNodeForContext = node;
    this.contextMenuPosition = { x, y };
    this.contextMenuItems = [
      {
        id: 'configure',
        label: 'Configure',
        icon: 'settings',
        action: () => this.configureNode(node)
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: 'edit',
        action: () => this.startRenaming(node)
      },
      {
        id: 'separator1',
        label: '',
        icon: '',
        action: () => {},
        separator: true
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: 'copy',
        action: () => this.duplicateNode(node)
      },
      {
        id: 'separator2',
        label: '',
        icon: '',
        action: () => {},
        separator: true
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'trash',
        action: () => this.deleteNode(node)
      }
    ];
    this.showContextMenu = true;
  }

  private configureNode(node: CanvasNode): void {
    console.log('Configuring node:', node);
    this.router.navigate(['/node-config', node.id, node.type]);
  }

  private startRenaming(node: CanvasNode): void {
    this.isRenaming = true;
    this.renamingNodeId = node.id;
    this.tempNodeName = node.label;
    
    setTimeout(() => {
      const input = document.getElementById(`rename-input-${node.id}`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 10);
  }

  private finishRenaming(save: boolean = true): void {
    if (save && this.renamingNodeId && this.tempNodeName.trim()) {
      const node = this.nodes.find(n => n.id === this.renamingNodeId);
      if (node) {
        node.label = this.tempNodeName.trim();
        this.markAsChanged();
      }
    }
    
    this.isRenaming = false;
    this.renamingNodeId = null;
    this.tempNodeName = '';
    this.draw();
  }

  private duplicateNode(node: CanvasNode): void {
    const newNode: CanvasNode = {
      ...node,
      id: Date.now().toString(),
      label: `${node.label} (Copy)`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50
      },
      selected: false
    };
    
    this.nodes.push(newNode);
    this.markAsChanged();
    this.draw();
  }

  private deleteNode(node: CanvasNode): void {
    if (confirm(`Are you sure you want to delete "${node.label}"?`)) {
      this.nodes = this.nodes.filter(n => n.id !== node.id);
      this.edges = this.edges.filter(edge => 
        edge.source !== node.id && edge.target !== node.id
      );
      
      this.markAsChanged();
      this.draw();
    }
  }

  onContextMenuItemClick(itemId: string): void {
    this.closeContextMenu();
  }

  closeContextMenu(): void {
    this.showContextMenu = false;
    this.selectedNodeForContext = null;
  }

  onRenameKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.finishRenaming(true);
    } else if (event.key === 'Escape') {
      this.finishRenaming(false);
    }
  }

  onRenameBlur(): void {
    this.finishRenaming(true);
  }

  // Event handlers
  private setupEventListeners(): void {
    const canvas = this.canvasRef.nativeElement;
    
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
    canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    canvas.addEventListener('dragover', (e) => e.preventDefault());
    canvas.addEventListener('drop', (e) => this.onDrop(e));
    canvas.addEventListener('contextmenu', (e) => this.onContextMenu(e));
  }

  private onContextMenu(e: MouseEvent): void {
    e.preventDefault();
    
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panOffset.x) / this.scale;
    const y = (e.clientY - rect.top - this.panOffset.y) / this.scale;

    const clickedNode = this.getNodeAt(x, y);
    
    if (clickedNode) {
      this.showNodeContextMenu(clickedNode, e.clientX, e.clientY);
    } else {
      this.closeContextMenu();
    }
  }

  private onMouseDown(e: MouseEvent): void {
    this.closeContextMenu();
    
    if (this.isRenaming) {
      this.finishRenaming(true);
    }

    e.preventDefault();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panOffset.x) / this.scale;
    const y = (e.clientY - rect.top - this.panOffset.y) / this.scale;

    // Check for connection points first
    const connectionPoint = this.getConnectionPointAt(x, y);
    if (connectionPoint) {
      if (this.isConnecting && this.connectionStart) {
        // Finish connection
        this.finishConnection(connectionPoint);
      } else {
        // Start connection
        this.startConnection(connectionPoint);
      }
      return;
    }

    // Cancel any ongoing connection if clicking elsewhere
    if (this.isConnecting) {
      this.cancelConnection();
      return;
    }

    const clickedNode = this.getNodeAt(x, y);
    
    if (clickedNode) {
      this.isDragging = true;
      this.dragNode = clickedNode;
      this.dragOffset = {
        x: x - clickedNode.position.x,
        y: y - clickedNode.position.y
      };
      
      this.nodes.forEach(node => node.selected = false);
      clickedNode.selected = true;
    } else {
      this.isPanning = true;
      this.lastPanPoint = { x: e.clientX, y: e.clientY };
      this.nodes.forEach(node => node.selected = false);
    }
    
    this.draw();
  }

  private onMouseMove(e: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panOffset.x) / this.scale;
    const y = (e.clientY - rect.top - this.panOffset.y) / this.scale;
    
    if (this.isConnecting) {
      this.tempConnectionEnd = { x, y };
      
      // Check if hovering over a connection point
      const connectionPoint = this.getConnectionPointAt(x, y);
      this.connectionEnd = connectionPoint;
      
      this.draw();
      return;
    }
    
    if (this.isDragging && this.dragNode) {
      this.dragNode.position.x = x - this.dragOffset.x;
      this.dragNode.position.y = y - this.dragOffset.y;
      
      this.markAsChanged();
      this.draw();
    } else if (this.isPanning) {
      const deltaX = e.clientX - this.lastPanPoint.x;
      const deltaY = e.clientY - this.lastPanPoint.y;
      
      this.panOffset.x += deltaX;
      this.panOffset.y += deltaY;
      
      this.lastPanPoint = { x: e.clientX, y: e.clientY };
      
      this.draw();
    }
  }

  private onMouseUp(e: MouseEvent): void {
    this.isDragging = false;
    this.dragNode = null;
    this.isPanning = false;
  }

  // Drawing methods
  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!this.ctx || !canvas.width || !canvas.height) return;
    
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    this.ctx.save();
    
    this.ctx.translate(this.panOffset.x, this.panOffset.y);
    this.ctx.scale(this.scale, this.scale);
    
    this.drawGrid();
    this.edges.forEach(edge => this.drawEdge(edge));
    this.nodes.forEach(node => this.drawNode(node));
    
    // Draw temporary connection line
    if (this.isConnecting && this.connectionStart) {
      this.drawTempConnection();
    }
    
    this.ctx.restore();
  }

  private drawTempConnection(): void {
    if (!this.connectionStart) return;
    
    const startX = this.connectionStart.x;
    const startY = this.connectionStart.y;
    const endX = this.connectionEnd ? this.connectionEnd.x : this.tempConnectionEnd.x;
    const endY = this.connectionEnd ? this.connectionEnd.y : this.tempConnectionEnd.y;
    
    this.ctx.strokeStyle = this.connectionEnd ? '#4CAF50' : '#999';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    
    const controlPoint1X = startX + (endX - startX) / 2;
    const controlPoint1Y = startY;
    const controlPoint2X = startX + (endX - startX) / 2;
    const controlPoint2Y = endY;
    
    this.ctx.moveTo(startX, startY);
    this.ctx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawConnectionPoints(node: CanvasNode): void {
    const x = node.position.x;
    const y = node.position.y;
    const { width, height } = node;
    
    // Enhanced connection points with hover effects
    this.ctx.fillStyle = '#2196F3';
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    
    // Input point (left)
    this.ctx.beginPath();
    this.ctx.arc(x, y + height / 2, 8, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Add inner circle for better visibility
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(x, y + height / 2, 3, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Output point (right)
    this.ctx.fillStyle = '#2196F3';
    this.ctx.beginPath();
    this.ctx.arc(x + width, y + height / 2, 8, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Add inner circle
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(x + width, y + height / 2, 3, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  // Public method to clear the canvas
  clearCanvas(): void {
    if (this.hasUnsavedChanges) {
      const confirmClear = confirm('You have unsaved changes. Are you sure you want to create a new workflow? All unsaved changes will be lost.');
      if (!confirmClear) {
        return;
      }
    }

    this.nodes = [];
    this.edges = [];
    this.scale = 1;
    this.panOffset = { x: 0, y: 0 };
    this.currentWorkflowId = null;
    this.hasUnsavedChanges = false;
    this.closeContextMenu();
    this.finishRenaming(false);
    this.cancelConnection();
    this.draw();
    
    console.log('Canvas cleared - New workflow started');
  }

  // Public method to load a workflow
  loadWorkflow(workflowData: any): void {
    if (this.hasUnsavedChanges) {
      const confirmLoad = confirm('You have unsaved changes. Are you sure you want to load this workflow? All unsaved changes will be lost.');
      if (!confirmLoad) {
        return;
      }
    }

    try {
      const definition = typeof workflowData.definitionJson === 'string' 
        ? JSON.parse(workflowData.definitionJson) 
        : workflowData.definitionJson;

      this.nodes = definition.nodes || [];
      this.edges = definition.edges || [];
      this.currentWorkflowId = workflowData.id;
      this.hasUnsavedChanges = false;
      
      this.scale = 1;
      this.panOffset = { x: 0, y: 0 };
      this.closeContextMenu();
      this.finishRenaming(false);
      this.cancelConnection();
      
      this.draw();
      console.log('Workflow loaded:', workflowData.name);
    } catch (error) {
      console.error('Error loading workflow:', error);
      alert('Error loading workflow. The workflow data may be corrupted.');
    }
  }

  // Public method to save current workflow
  saveWorkflow(): any {
    const workflowDefinition = {
      nodes: this.nodes.map(node => ({
        id: node.id,
        label: node.label,
        type: node.type,
        position: node.position,
        data: node.data
      })),
      edges: this.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label
      }))
    };

    this.hasUnsavedChanges = false;
    console.log('Workflow saved');
    return workflowDefinition;
  }

  // Public method to check if there are unsaved changes
  hasChanges(): boolean {
    return this.hasUnsavedChanges;
  }

  // Public method to get current workflow ID
  getCurrentWorkflowId(): string | null {
    return this.currentWorkflowId;
  }

  private markAsChanged(): void {
    this.hasUnsavedChanges = true;
  }

  private setupCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;
    
    this.resizeCanvas();
    this.ctx = canvas.getContext('2d')!;
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;
    
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas();
        this.draw();
      });
      this.resizeObserver.observe(this.containerRef.nativeElement);
    } else {
      window.addEventListener('resize', this.onWindowResize);
    }
  }

  private onWindowResize = (): void => {
    this.resizeCanvas();
    this.draw();
  };

  private initializeSampleWorkflow(): void {
    this.nodes = [
      {
        id: '1',
        label: 'Webhook Trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {},
        selected: false,
        width: 150,
        height: 80
      },
      {
        id: '2',
        label: 'AI Agent',
        type: 'ai-agent',
        position: { x: 350, y: 100 },
        data: {},
        selected: false,
        width: 150,
        height: 80
      },
      {
        id: '3',
        label: 'Send Email',
        type: 'action',
        position: { x: 600, y: 100 },
        data: {},
        selected: false,
        width: 150,
        height: 80
      }
    ];

    this.edges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        selected: false
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        selected: false
      }
    ];
  }

  // Canvas control methods
  zoomIn(): void {
    const canvas = this.canvasRef.nativeElement;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const oldScale = this.scale;
    this.scale = Math.min(3, this.scale * 1.2);
    const scaleRatio = this.scale / oldScale;
    
    this.panOffset.x = centerX - (centerX - this.panOffset.x) * scaleRatio;
    this.panOffset.y = centerY - (centerY - this.panOffset.y) * scaleRatio;
    
    this.draw();
  }

  zoomOut(): void {
    const canvas = this.canvasRef.nativeElement;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const oldScale = this.scale;
    this.scale = Math.max(0.1, this.scale / 1.2);
    const scaleRatio = this.scale / oldScale;
    
    this.panOffset.x = centerX - (centerX - this.panOffset.x) * scaleRatio;
    this.panOffset.y = centerY - (centerY - this.panOffset.y) * scaleRatio;
    
    this.draw();
  }

  resetZoom(): void {
    this.scale = 1;
    this.panOffset = { x: 0, y: 0 };
    this.draw();
  }

  fitToScreen(): void {
    if (this.nodes.length === 0) {
      this.resetZoom();
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    this.nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.width);
      maxY = Math.max(maxY, node.position.y + node.height);
    });

    const canvas = this.canvasRef.nativeElement;
    const padding = 50;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    
    const scaleX = canvas.width / contentWidth;
    const scaleY = canvas.height / contentHeight;
    this.scale = Math.min(scaleX, scaleY, 1);
    
    this.panOffset.x = (canvas.width - contentWidth * this.scale) / 2 - (minX - padding) * this.scale;
    this.panOffset.y = (canvas.height - contentHeight * this.scale) / 2 - (minY - padding) * this.scale;
    
    this.draw();
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * 0.1);
    
    const oldScale = this.scale;
    this.scale *= zoom;
    this.scale = Math.max(0.1, Math.min(3, this.scale));
    
    const scaleRatio = this.scale / oldScale;
    
    this.panOffset.x = mouseX - (mouseX - this.panOffset.x) * scaleRatio;
    this.panOffset.y = mouseY - (mouseY - this.panOffset.y) * scaleRatio;
    
    this.draw();
  }

  private onDrop(e: DragEvent): void {
    e.preventDefault();
    
    const nodeType = e.dataTransfer?.getData('text/plain');
    if (!nodeType) return;
    
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panOffset.x) / this.scale;
    const y = (e.clientY - rect.top - this.panOffset.y) / this.scale;
    
    const newNode: CanvasNode = {
      id: Date.now().toString(),
      label: this.getNodeLabel(nodeType),
      type: nodeType,
      position: { x: x - 75, y: y - 40 },
      data: {},
      selected: false,
      width: 150,
      height: 80
    };
    
    this.nodes.push(newNode);
    this.markAsChanged();
    this.draw();
  }

  private getNodeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'trigger': 'New Trigger',
      'action': 'New Action',
      'condition': 'New Condition',
      'ai-agent': 'New AI Agent'
    };
    return labels[type] || 'New Node';
  }

  private getNodeAt(x: number, y: number): CanvasNode | null {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      if (x >= node.position.x && x <= node.position.x + node.width &&
          y >= node.position.y && y <= node.position.y + node.height) {
        return node;
      }
    }
    return null;
  }

  private drawGrid(): void {
    const gridSize = 20;
    const canvas = this.canvasRef.nativeElement;
    
    this.ctx.strokeStyle = '#f0f0f0';
    this.ctx.lineWidth = 1;
    
    const startX = Math.floor(-this.panOffset.x / this.scale / gridSize) * gridSize;
    const startY = Math.floor(-this.panOffset.y / this.scale / gridSize) * gridSize;
    const endX = startX + (canvas.width / this.scale) + gridSize;
    const endY = startY + (canvas.height / this.scale) + gridSize;
    
    for (let x = startX; x < endX; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }
    
    for (let y = startY; y < endY; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.stroke();
    }
  }

  private drawNode(node: CanvasNode): void {
    const x = node.position.x;
    const y = node.position.y;
    const { width, height } = node;
    
    this.ctx.fillStyle = this.getNodeColor(node.type);
    this.ctx.strokeStyle = node.selected ? '#2196F3' : '#ddd';
    this.ctx.lineWidth = node.selected ? 3 : 1;
    
    this.drawRoundedRect(x, y, width, height, 8);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.getNodeIcon(node.type), x + width / 2, y + 30);
    
    this.ctx.fillStyle = '#333';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(node.label, x + width / 2, y + height - 15);
    
    this.drawConnectionPoints(node);
  }

  private drawEdge(edge: CanvasEdge): void {
    const sourceNode = this.nodes.find(n => n.id === edge.source);
    const targetNode = this.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return;
    
    const startX = sourceNode.position.x + sourceNode.width;
    const startY = sourceNode.position.y + sourceNode.height / 2;
    const endX = targetNode.position.x;
    const endY = targetNode.position.y + targetNode.height / 2;
    
    this.ctx.strokeStyle = edge.selected ? '#2196F3' : '#666';
    this.ctx.lineWidth = edge.selected ? 3 : 2;
    this.ctx.beginPath();
    
    const controlPoint1X = startX + (endX - startX) / 2;
    const controlPoint1Y = startY;
    const controlPoint2X = startX + (endX - startX) / 2;
    const controlPoint2Y = endY;
    
    this.ctx.moveTo(startX, startY);
    this.ctx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY);
    this.ctx.stroke();
    
    this.drawArrowhead(endX, endY, Math.atan2(endY - controlPoint2Y, endX - controlPoint2X));
  }

  private drawArrowhead(x: number, y: number, angle: number): void {
    const headLength = 10;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x - headLength * Math.cos(angle - Math.PI / 6),
      y - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x - headLength * Math.cos(angle + Math.PI / 6),
      y - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  private getNodeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'trigger': '#4CAF50',
      'action': '#2196F3',
      'condition': '#FF9800',
      'ai-agent': '#9C27B0'
    };
    return colors[type] || '#757575';
  }

  private getNodeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'trigger': '⚡',
      'action': '🔧',
      'condition': '❓',
      'ai-agent': '🧠'
    };
    return icons[type] || '⚙️';
  }
}
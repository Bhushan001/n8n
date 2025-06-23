import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div 
      *ngIf="visible"
      class="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-48"
      [style.left.px]="position.x"
      [style.top.px]="position.y"
    >
      <div *ngFor="let item of items">
        <hr *ngIf="item.separator" class="my-1 border-gray-200">
        <button
          *ngIf="!item.separator"
          (click)="onItemClick(item)"
          [disabled]="item.disabled"
          class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          [class.text-red-600]="item.id === 'delete'"
          [class.hover:bg-red-50]="item.id === 'delete'"
        >
          <app-icon [name]="item.icon" [size]="16"></app-icon>
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    }
    
    .fixed {
      pointer-events: auto;
    }
  `]
})
export class ContextMenuComponent implements OnInit, OnDestroy {
  @Input() visible = false;
  @Input() position = { x: 0, y: 0 };
  @Input() items: ContextMenuItem[] = [];
  @Output() itemClick = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    document.addEventListener('click', this.onDocumentClick);
    document.addEventListener('contextmenu', this.onDocumentClick);
    document.addEventListener('keydown', this.onKeyDown);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick);
    document.removeEventListener('contextmenu', this.onDocumentClick);
    document.removeEventListener('keydown', this.onKeyDown);
  }

  private onDocumentClick = (event: Event): void => {
    if (this.visible) {
      this.close.emit();
    }
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.visible) {
      this.close.emit();
    }
  };

  onItemClick(item: ContextMenuItem): void {
    if (!item.disabled) {
      this.itemClick.emit(item.id);
      item.action();
      this.close.emit();
    }
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      [attr.width]="size" 
      [attr.height]="size" 
      [attr.viewBox]="viewBox" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      [class]="className">
      <ng-container [ngSwitch]="name">
        <!-- Eye -->
        <g *ngSwitchCase="'eye'">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </g>
        <!-- Eye Off -->
        <g *ngSwitchCase="'eye-off'">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </g>
        <!-- Mail -->
        <g *ngSwitchCase="'mail'">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </g>
        <!-- Lock -->
        <g *ngSwitchCase="'lock'">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </g>
        <!-- Workflow -->
        <g *ngSwitchCase="'workflow'">
          <rect x="3" y="3" width="6" height="6" rx="1"/>
          <rect x="15" y="3" width="6" height="6" rx="1"/>
          <rect x="9" y="15" width="6" height="6" rx="1"/>
          <path d="M6 9v1a2 2 0 0 0 2 2h1m7-3v1a2 2 0 0 1-2 2h-1"/>
        </g>
        <!-- Alert Circle -->
        <g *ngSwitchCase="'alert-circle'">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </g>
        <!-- Loader -->
        <g *ngSwitchCase="'loader'">
          <line x1="12" y1="2" x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
          <line x1="2" y1="12" x2="6" y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
        </g>
        <!-- Menu -->
        <g *ngSwitchCase="'menu'">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </g>
        <!-- User -->
        <g *ngSwitchCase="'user'">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </g>
        <!-- Settings -->
        <g *ngSwitchCase="'settings'">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </g>
        <!-- Log Out -->
        <g *ngSwitchCase="'log-out'">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </g>
        <!-- Home -->
        <g *ngSwitchCase="'home'">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </g>
        <!-- Play -->
        <g *ngSwitchCase="'play'">
          <polygon points="5,3 19,12 5,21"/>
        </g>
        <!-- Plus -->
        <g *ngSwitchCase="'plus'">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </g>
        <!-- Minus -->
        <g *ngSwitchCase="'minus'">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </g>
        <!-- Save -->
        <g *ngSwitchCase="'save'">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17,21 17,13 7,13 7,21"/>
          <polyline points="7,3 7,8 15,8"/>
        </g>
        <!-- Chevron Down -->
        <g *ngSwitchCase="'chevron-down'">
          <polyline points="6,9 12,15 18,9"/>
        </g>
        <!-- Maximize -->
        <g *ngSwitchCase="'maximize'">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </g>
        <!-- Fit Screen -->
        <g *ngSwitchCase="'fit-screen'">
          <path d="M15 3h4a2 2 0 0 1 2 2v4m0 6v4a2 2 0 0 1-2 2h-4M9 21H5a2 2 0 0 1-2-2v-4m0-6V5a2 2 0 0 1 2-2h4"/>
        </g>
        <!-- Arrow Left -->
        <g *ngSwitchCase="'arrow-left'">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12,19 5,12 12,5"/>
        </g>
        <!-- Edit -->
        <g *ngSwitchCase="'edit'">
          <path d="M11 4H4a2 2 0 0 1-2-2V14a2 2 0 0 1 2 2h14a2 2 0 0 1 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </g>
        <!-- Copy -->
        <g *ngSwitchCase="'copy'">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </g>
        <!-- Trash -->
        <g *ngSwitchCase="'trash'">
          <polyline points="3,6 5,6 21,6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </g>
        <!-- Refresh -->
        <g *ngSwitchCase="'refresh'">
          <polyline points="23,4 23,10 17,10"/>
          <polyline points="1,20 1,14 7,14"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </g>
        <!-- Search -->
        <g *ngSwitchCase="'search'">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </g>
        <!-- Check -->
        <g *ngSwitchCase="'check'">
          <polyline points="20,6 9,17 4,12"/>
        </g>
        <!-- X -->
        <g *ngSwitchCase="'x'">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </g>
        <!-- Pause -->
        <g *ngSwitchCase="'pause'">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </g>
        <!-- Help -->
        <g *ngSwitchCase="'help'">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </g>
        <!-- Info -->
        <g *ngSwitchCase="'info'">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </g>
        <!-- Credit Card -->
        <g *ngSwitchCase="'credit-card'">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </g>
        <!-- Chevron Right -->
        <g *ngSwitchCase="'chevron-right'">
          <polyline points="9,18 15,12 9,6"/>
        </g>
        <!-- Chevron Left -->
        <g *ngSwitchCase="'chevron-left'">
          <polyline points="15,18 9,12 15,6"/>
        </g>
        <!-- Webhook -->
        <g *ngSwitchCase="'webhook'">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          <path d="M12 6v6l4 2"/>
        </g>
        <!-- Clock -->
        <g *ngSwitchCase="'clock'">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </g>
        <!-- Globe -->
        <g *ngSwitchCase="'globe'">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </g>
        <!-- Database -->
        <g *ngSwitchCase="'database'">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </g>
        <!-- Brain -->
        <g *ngSwitchCase="'brain'">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.44 2.5 2.5 0 0 1 1.96-2.5A2.5 2.5 0 0 1 9.5 2z"/>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.44 2.5 2.5 0 0 0-1.96-2.5A2.5 2.5 0 0 0 14.5 2z"/>
        </g>
        <!-- Image -->
        <g *ngSwitchCase="'image'">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </g>
        <!-- Zap -->
        <g *ngSwitchCase="'zap'">
          <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
        </g>
        <!-- Activity -->
        <g *ngSwitchCase="'activity'">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </g>
        <!-- Bar Chart -->
        <g *ngSwitchCase="'bar-chart'">
          <line x1="12" y1="20" x2="12" y2="10"/>
          <line x1="18" y1="20" x2="18" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="16"/>
        </g>
        <!-- Calendar -->
        <g *ngSwitchCase="'calendar'">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </g>
        <!-- File Text -->
        <g *ngSwitchCase="'file-text'">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </g>
        <!-- Folder -->
        <g *ngSwitchCase="'folder'">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </g>
        <!-- Link -->
        <g *ngSwitchCase="'link'">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </g>
        <!-- Download -->
        <g *ngSwitchCase="'download'">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </g>
        <!-- Upload -->
        <g *ngSwitchCase="'upload'">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17,8 12,3 7,8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </g>
        <!-- Filter -->
        <g *ngSwitchCase="'filter'">
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
        </g>
        <!-- More Horizontal -->
        <g *ngSwitchCase="'more-horizontal'">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="19" cy="12" r="1"/>
          <circle cx="5" cy="12" r="1"/>
        </g>
        <!-- More Vertical -->
        <g *ngSwitchCase="'more-vertical'">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </g>
        <!-- External Link -->
        <g *ngSwitchCase="'external-link'">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15,3 21,3 21,9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </g>
        <!-- Code -->
        <g *ngSwitchCase="'code'">
          <polyline points="16,18 22,12 16,6"/>
          <polyline points="8,6 2,12 8,18"/>
        </g>
        <!-- Terminal -->
        <g *ngSwitchCase="'terminal'">
          <polyline points="4,17 10,11 4,5"/>
          <line x1="12" y1="19" x2="20" y2="19"/>
        </g>
        <!-- Command -->
        <g *ngSwitchCase="'command'">
          <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
        </g>
        <!-- Shield -->
        <g *ngSwitchCase="'shield'">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </g>
        <!-- Key -->
        <g *ngSwitchCase="'key'">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
        </g>
        <!-- Bell -->
        <g *ngSwitchCase="'bell'">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </g>
        <!-- Star -->
        <g *ngSwitchCase="'star'">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
        </g>
        <!-- Heart -->
        <g *ngSwitchCase="'heart'">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </g>
        <!-- Thumbs Up -->
        <g *ngSwitchCase="'thumbs-up'">
          <path d="M14 9V5a3 3 0 0 0-6 0v4H2l3 9h12l-3-9h-4z"/>
          <path d="M9 12l2 2 4-4"/>
        </g>
        <!-- Thumbs Down -->
        <g *ngSwitchCase="'thumbs-down'">
          <path d="M10 15V19a3 3 0 0 0 6 0v-4h6l-3-9H9l3 9h4z"/>
          <path d="M15 12l-2-2-4 4"/>
        </g>
        <!-- Message Circle -->
        <g *ngSwitchCase="'message-circle'">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </g>
        <!-- Message Square -->
        <g *ngSwitchCase="'message-square'">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </g>
        <!-- Phone -->
        <g *ngSwitchCase="'phone'">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </g>
        <!-- Video -->
        <g *ngSwitchCase="'video'">
          <polygon points="23,7 16,12 23,17 23,7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </g>
        <!-- Camera -->
        <g *ngSwitchCase="'camera'">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </g>
        <!-- Music -->
        <g *ngSwitchCase="'music'">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </g>
        <!-- Volume -->
        <g *ngSwitchCase="'volume'">
          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </g>
        <!-- Volume X -->
        <g *ngSwitchCase="'volume-x'">
          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </g>
        <!-- Volume 1 -->
        <g *ngSwitchCase="'volume-1'">
          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </g>
        <!-- Volume 2 -->
        <g *ngSwitchCase="'volume-2'">
          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </g>
        <!-- Mute -->
        <g *ngSwitchCase="'mute'">
          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </g>
        <!-- Wifi -->
        <g *ngSwitchCase="'wifi'">
          <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
          <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <line x1="12" y1="20" x2="12.01" y2="20"/>
        </g>
        <!-- Wifi Off -->
        <g *ngSwitchCase="'wifi-off'">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <line x1="12" y1="20" x2="12.01" y2="20"/>
        </g>
        <!-- Bluetooth -->
        <g *ngSwitchCase="'bluetooth'">
          <polyline points="6.5,6.5 17.5,17.5 12,23 12,1 17.5,6.5 6.5,17.5"/>
        </g>
        <!-- Bluetooth Off -->
        <g *ngSwitchCase="'bluetooth-off'">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M6.5 6.5a17.5 17.5 0 0 0 11 11"/>
          <path d="M12 1v6.5L17.5 6.5"/>
          <path d="M12 23v-6.5L17.5 17.5"/>
        </g>
        <!-- Battery -->
        <g *ngSwitchCase="'battery'">
          <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
          <line x1="23" y1="10" x2="23" y2="14"/>
        </g>
        <!-- Battery Charging -->
        <g *ngSwitchCase="'battery-charging'">
          <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 18h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.19"/>
          <line x1="23" y1="13" x2="23" y2="11"/>
          <polyline points="11,6 7,12 13,12 11,18"/>
        </g>
        <!-- Battery Low -->
        <g *ngSwitchCase="'battery-low'">
          <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
          <line x1="23" y1="10" x2="23" y2="14"/>
          <line x1="20" y1="10" x2="20" y2="14"/>
        </g>
        <!-- Battery Medium -->
        <g *ngSwitchCase="'battery-medium'">
          <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
          <line x1="23" y1="10" x2="23" y2="14"/>
          <line x1="20" y1="10" x2="20" y2="14"/>
          <line x1="17" y1="10" x2="17" y2="14"/>
        </g>
        <!-- Battery Full -->
        <g *ngSwitchCase="'battery-full'">
          <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
          <line x1="23" y1="10" x2="23" y2="14"/>
          <line x1="20" y1="10" x2="20" y2="14"/>
          <line x1="17" y1="10" x2="17" y2="14"/>
          <line x1="14" y1="10" x2="14" y2="14"/>
        </g>
        <!-- Default icon for unknown names -->
        <g *ngSwitchDefault>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </g>
      </ng-container>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: number = 24;
  @Input() className: string = '';

  get viewBox(): string {
    return '0 0 24 24';
  }
}
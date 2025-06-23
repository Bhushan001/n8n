import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WorkflowsComponent } from './components/workflows/workflows.component';
import { ExecutionsComponent } from './components/executions/executions.component';
import { SettingsComponent } from './components/settings/settings.component';
import { NodeConfigComponent } from './components/node-config/node-config.component';
import { NodeEditorComponent } from './components/node-editor/node-editor.component';
import { WorkflowEditorComponent } from './components/workflow-editor/workflow-editor.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'workflows', component: WorkflowsComponent },
      { path: 'workflow-editor', component: WorkflowEditorComponent },
      { path: 'workflow-editor/:id', component: WorkflowEditorComponent },
      { path: 'executions', component: ExecutionsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'node-config/:nodeId/:nodeType', component: NodeConfigComponent },
      { path: 'node/:id', component: NodeEditorComponent }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
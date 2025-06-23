import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WorkflowsComponent } from './components/workflows/workflows.component';
import { ExecutionsComponent } from './components/executions/executions.component';
import { SettingsComponent } from './components/settings/settings.component';
import { NodeConfigComponent } from './components/node-config/node-config.component';
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
      { path: 'executions', component: ExecutionsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'node-config/:nodeId/:nodeType', component: NodeConfigComponent }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
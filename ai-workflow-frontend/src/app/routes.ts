import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WorkflowsComponent } from './components/workflows/workflows.component';
import { WorkflowEditorComponent } from './components/workflow-editor/workflow-editor.component';
import { ExecutionsComponent } from './components/executions/executions.component';
import { SettingsComponent } from './components/settings/settings.component';
import { NodeEditorComponent } from './components/node-editor/node-editor.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'workflows', component: WorkflowsComponent },
            { path: 'workflow/new', component: WorkflowEditorComponent },
            { path: 'workflow/:id', component: WorkflowEditorComponent },
            { path: 'executions', component: ExecutionsComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'node/:id', component: NodeEditorComponent },
        ],
    },
    { path: '**', redirectTo: '' },
]; 
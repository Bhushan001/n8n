import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  activeTab = 'general';
  
  // Settings data
  settings = {
    general: {
      autoSave: true,
      notifications: true,
      theme: 'light',
      language: 'en'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      apiKeyRotation: true
    },
    integrations: {
      webhookUrl: '',
      slackNotifications: false,
      emailNotifications: true
    }
  };

  tabs = [
    { id: 'general', name: 'General', icon: 'settings' },
    { id: 'security', name: 'Security', icon: 'lock' },
    { id: 'integrations', name: 'Integrations', icon: 'workflow' },
    { id: 'billing', name: 'Billing', icon: 'credit-card' }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  saveSettings(): void {
    console.log('Settings saved:', this.settings);
    // Here you would call your API to save settings
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default values
      console.log('Settings reset to default');
    }
  }
}

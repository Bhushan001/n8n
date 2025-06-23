import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, User } from '../../services/auth.service';
import { UserService, UserProfile } from '../../services/user.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconComponent
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  userProfile: UserProfile | null = null;
  sidenavOpened = true;
  showUserMenu = false;
  isMobile = false;
  currentRoute = '';
  pageTitle = '';
  isLoadingUser = true;
  private profileLoaded = false;

  // Node palette data
  triggerNodes = [
    {
      name: 'Webhook',
      type: 'webhook',
      category: 'trigger',
      description: 'Trigger workflow via HTTP webhook',
      icon: 'webhook',
      colorClass: 'bg-green-500'
    },
    {
      name: 'Schedule',
      type: 'schedule',
      category: 'trigger',
      description: 'Trigger workflow on a schedule',
      icon: 'clock',
      colorClass: 'bg-blue-500'
    },
    {
      name: 'Manual',
      type: 'manual',
      category: 'trigger',
      description: 'Trigger workflow manually',
      icon: 'play',
      colorClass: 'bg-purple-500'
    }
  ];

  actionNodes = [
    {
      name: 'HTTP Request',
      type: 'http',
      category: 'action',
      description: 'Make HTTP requests to external APIs',
      icon: 'globe',
      colorClass: 'bg-blue-500'
    },
    {
      name: 'Email',
      type: 'email',
      category: 'action',
      description: 'Send emails via SMTP',
      icon: 'mail',
      colorClass: 'bg-green-500'
    },
    {
      name: 'Database',
      type: 'database',
      category: 'action',
      description: 'Execute database queries',
      icon: 'database',
      colorClass: 'bg-orange-500'
    }
  ];

  aiNodes = [
    {
      name: 'OpenAI',
      type: 'openai',
      category: 'ai',
      description: 'Generate text using OpenAI models',
      icon: 'brain',
      colorClass: 'bg-purple-500'
    },
    {
      name: 'Image Generation',
      type: 'image-gen',
      category: 'ai',
      description: 'Generate images using AI models',
      icon: 'image',
      colorClass: 'bg-pink-500'
    },
    {
      name: 'Text Analysis',
      type: 'text-analysis',
      category: 'ai',
      description: 'Analyze text sentiment and extract entities',
      icon: 'search',
      colorClass: 'bg-indigo-500'
    }
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoadingUser = false;
      
      // If user is logged in and profile hasn't been loaded yet, fetch additional profile info
      if (user && !this.profileLoaded) {
        this.loadUserProfile();
      }
    });
    
    this.checkScreenSize();
    this.setupClickOutsideListener();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentRoute = this.router.url;
      this.updatePageTitle();
    });
    
    this.currentRoute = this.router.url;
    this.updatePageTitle();
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClickOutside);
  }

  private loadUserProfile(): void {
    // Try to load additional user profile information
    this.userService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileLoaded = true;
        // Update the auth service with the complete profile
        this.authService.updateUserInfo(profile);
      },
      error: (error) => {
        console.log('Could not load user profile:', error);
        this.profileLoaded = true;
        // This is not critical, we can continue with basic user info
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private updatePageTitle(): void {
    const routeTitles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/workflows': 'Workflows',
      '/executions': 'Executions',
      '/settings': 'Settings'
    };
    
    this.pageTitle = routeTitles[this.currentRoute] || 'Dashboard';
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile) {
      this.sidenavOpened = false;
    }
  }

  private setupClickOutsideListener(): void {
    document.addEventListener('click', this.handleClickOutside);
  }

  private handleClickOutside = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.showUserMenu = false;
    }
  };

  logout(): void {
    this.authService.logout();
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  closeSidenav(): void {
    this.sidenavOpened = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  getSidebarClasses(): string {
    const baseClasses = 'bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0';
    
    if (this.isMobile) {
      return `${baseClasses} fixed left-0 top-16 bottom-0 w-64 z-50 transform ${
        this.sidenavOpened ? 'translate-x-0' : '-translate-x-full'
      }`;
    } else {
      return `${baseClasses} ${this.sidenavOpened ? 'w-64' : 'w-0 overflow-hidden'}`;
    }
  }

  onNodeDragStart(event: DragEvent, node: any): void {
    event.dataTransfer?.setData('application/json', JSON.stringify(node));
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  navigateAndCloseSidebar(route: string): void {
    this.router.navigate([route]);
    if (this.isMobile) {
      this.closeSidenav();
    }
  }

  isDashboardRoute(): boolean {
    return this.currentRoute === '/dashboard';
  }

  onNewWorkflowFromSidebar(): void {
    this.router.navigate(['/workflow-editor']);
    
    if (this.isMobile) {
      this.closeSidenav();
    }
  }

  // Helper methods for user display
  getUserDisplayName(): string {
    // Try userProfile first
    if (this.userProfile) {
      const firstName = this.userProfile.firstName || '';
      const lastName = this.userProfile.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
      // Fallback to username if no name is available
      return this.userProfile.username || 'User';
    }
    
    // Try currentUser as fallback
    if (this.currentUser) {
      const firstName = this.currentUser.firstName || '';
      const lastName = this.currentUser.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
      // Fallback to username if no name is available
      return this.currentUser.username || 'User';
    }
    
    return 'User';
  }

  getUserEmail(): string {
    return this.userProfile?.email || this.currentUser?.email || '';
  }

  getUserInitials(): string {
    const user = this.userProfile || this.currentUser;
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const firstInitial = firstName.charAt(0)?.toUpperCase() || '';
      const lastInitial = lastName.charAt(0)?.toUpperCase() || '';
      
      if (firstInitial && lastInitial) {
        return firstInitial + lastInitial;
      } else if (firstInitial) {
        return firstInitial;
      } else if (lastInitial) {
        return lastInitial;
      } else if (user.username) {
        // Fallback to username initials
        return user.username.charAt(0).toUpperCase();
      }
    }
    return 'U';
  }

  hasUserAvatar(): boolean {
    return !!(this.userProfile?.avatar);
  }

  getUserAvatar(): string {
    return this.userProfile?.avatar || '';
  }
}
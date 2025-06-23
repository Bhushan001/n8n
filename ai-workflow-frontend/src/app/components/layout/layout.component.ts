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
      
      // If user is logged in, try to fetch additional profile info
      if (user) {
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
        // Update the auth service with the complete profile
        this.authService.updateUserInfo(profile);
      },
      error: (error) => {
        console.log('Could not load user profile:', error);
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

  onNodeDragStart(event: DragEvent, nodeType: string): void {
    event.dataTransfer?.setData('text/plain', nodeType);
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
    this.router.navigate(['/dashboard']).then(() => {
      window.dispatchEvent(new CustomEvent('newWorkflow'));
    });
    
    if (this.isMobile) {
      this.closeSidenav();
    }
  }

  // Helper methods for user display
  getUserDisplayName(): string {
    if (this.userProfile) {
      return `${this.userProfile.firstName} ${this.userProfile.lastName}`.trim();
    }
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
    }
    return 'User';
  }

  getUserEmail(): string {
    return this.userProfile?.email || this.currentUser?.email || '';
  }

  getUserInitials(): string {
    const user = this.userProfile || this.currentUser;
    if (user) {
      const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
      const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
      return firstInitial + lastInitial;
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
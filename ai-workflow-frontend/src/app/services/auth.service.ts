import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, tap, switchMap, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwtToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  roles?: string[];
  isActive: boolean;
}

interface JWTPayload {
  sub: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenRefreshTimer?: any;

  constructor(private http: HttpClient, private router: Router) {
    this.initializeUserFromToken();
  }

  private initializeUserFromToken(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      const userInfo = this.extractUserFromToken(token);
      if (userInfo) {
        this.currentUserSubject.next(userInfo);
        this.scheduleTokenRefresh(token);
      }
    } else {
      this.removeToken();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.jwtToken);
          if (response.refreshToken) {
            this.setRefreshToken(response.refreshToken);
          }
          const userInfo = this.extractUserFromToken(response.jwtToken);
          if (userInfo) {
            this.currentUserSubject.next(userInfo);
          }
          this.scheduleTokenRefresh(response.jwtToken);
          this.router.navigate(['/dashboard']);
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.currentUserSubject.next(null);
    this.clearTokenRefreshTimer();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.setToken(response.jwtToken);
          if (response.refreshToken) {
            this.setRefreshToken(response.refreshToken);
          }
          this.scheduleTokenRefresh(response.jwtToken);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  private scheduleTokenRefresh(token: string): void {
    this.clearTokenRefreshTimer();
    const payload = this.decodeJWTPayload(token);
    const expiresIn = payload.exp * 1000 - Date.now();
    const refreshTime = expiresIn - (5 * 60 * 1000); // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      this.tokenRefreshTimer = timer(refreshTime).pipe(
        switchMap(() => this.refreshToken()),
        retry(3)
      ).subscribe({
        error: (error) => {
          console.error('Token refresh failed:', error);
          this.logout();
        }
      });
    }
  }

  private clearTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      this.tokenRefreshTimer.unsubscribe();
      this.tokenRefreshTimer = undefined;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  private removeRefreshToken(): void {
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? this.isTokenValid(token) : false;
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeJWTPayload(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  private decodeJWTPayload(token: string): JWTPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token format');
    }
  }

  private extractUserFromToken(token: string): User | null {
    try {
      const payload = this.decodeJWTPayload(token);
      
      const user: User = {
        id: 0, // Will be updated from backend if needed
        email: payload.email || payload.sub || '',
        username: payload.username || payload.sub || '',
        firstName: payload.firstName,
        lastName: payload.lastName,
        roles: payload.roles || ['USER'],
        isActive: true
      };

      return user;
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Server Error: ${error.status}`;
    }
    
    console.error('Auth Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshUserInfo(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      const userInfo = this.extractUserFromToken(token);
      if (userInfo) {
        this.currentUserSubject.next(userInfo);
      }
    }
  }

  updateUserInfo(updatedUser: Partial<User>): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      this.currentUserSubject.next(newUser);
    }
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.some(role => roles.includes(role)) || false;
  }
}
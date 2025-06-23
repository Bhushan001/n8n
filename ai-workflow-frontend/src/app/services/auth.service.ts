import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwtToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

interface JWTPayload {
  sub: string; // subject (usually email or username)
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  exp: number; // expiration time
  iat: number; // issued at
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check if user is already logged in and load user info
    this.initializeUserFromToken();
  }

  private initializeUserFromToken(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      const userInfo = this.extractUserFromToken(token);
      if (userInfo) {
        this.currentUserSubject.next(userInfo);
      }
    } else {
      // Token is invalid or expired, remove it
      this.removeToken();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.jwtToken);
          const userInfo = this.extractUserFromToken(response.jwtToken);
          if (userInfo) {
            this.currentUserSubject.next(userInfo);
          }
          this.router.navigate(['/dashboard']);
        })
      );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/register`, userData);
  }

  logout(): void {
    this.removeToken();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('token');
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
      
      // Extract user information from JWT payload
      // The exact structure depends on how your backend creates the JWT
      const user: User = {
        id: 0, // You might need to get this from the payload or make an API call
        email: payload.email || payload.sub || '',
        firstName: payload.firstName || this.extractFirstNameFromEmail(payload.email || payload.sub || ''),
        lastName: payload.lastName || this.extractLastNameFromEmail(payload.email || payload.sub || ''),
        roles: payload.roles || []
      };

      return user;
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  }

  private extractFirstNameFromEmail(email: string): string {
    // Fallback: extract first name from email if not provided in token
    if (!email) return 'User';
    
    const localPart = email.split('@')[0];
    const parts = localPart.split(/[._-]/);
    return parts[0] ? this.capitalizeFirstLetter(parts[0]) : 'User';
  }

  private extractLastNameFromEmail(email: string): string {
    // Fallback: extract last name from email if not provided in token
    if (!email) return '';
    
    const localPart = email.split('@')[0];
    const parts = localPart.split(/[._-]/);
    return parts.length > 1 ? this.capitalizeFirstLetter(parts[1]) : '';
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Method to get current user synchronously
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Method to refresh user info (useful after profile updates)
  refreshUserInfo(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      const userInfo = this.extractUserFromToken(token);
      if (userInfo) {
        this.currentUserSubject.next(userInfo);
      }
    }
  }

  // Method to update user info locally (after profile update)
  updateUserInfo(updatedUser: Partial<User>): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      this.currentUserSubject.next(newUser);
    }
  }
}
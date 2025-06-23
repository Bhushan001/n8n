import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service';

export interface UserProfile extends User {
  avatar?: string;
  phone?: string;
  company?: string;
  timezone?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  getCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API_URL}/me`);
  }

  updateUserProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.API_URL}/me`, profile);
  }

  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ avatarUrl: string }>(`${this.API_URL}/avatar`, formData);
  }
}

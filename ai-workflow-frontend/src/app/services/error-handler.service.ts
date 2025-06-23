import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export interface ErrorInfo {
  message: string;
  status?: number;
  timestamp: Date;
  url?: string;
  userAgent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorLog: ErrorInfo[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  handleError(error: HttpErrorResponse | Error, context?: string): void {
    const errorInfo: ErrorInfo = {
      message: this.extractErrorMessage(error),
      status: this.extractStatus(error),
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Log the error
    this.logError(errorInfo, context);

    // Handle specific error types
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleGenericError(error);
    }
  }

  private extractErrorMessage(error: HttpErrorResponse | Error): string {
    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        return `Client Error: ${error.error.message}`;
      } else {
        return error.error?.message || error.message || `HTTP ${error.status} Error`;
      }
    }
    return error.message || 'An unknown error occurred';
  }

  private extractStatus(error: HttpErrorResponse | Error): number | undefined {
    if (error instanceof HttpErrorResponse) {
      return error.status;
    }
    return undefined;
  }

  private handleHttpError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        this.handleForbidden();
        break;
      case 404:
        this.handleNotFound();
        break;
      case 500:
        this.handleServerError();
        break;
      default:
        this.showErrorMessage(this.extractErrorMessage(error));
    }
  }

  private handleGenericError(error: Error): void {
    console.error('Generic Error:', error);
    this.showErrorMessage(error.message);
  }

  private handleUnauthorized(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showErrorMessage('Your session has expired. Please log in again.');
  }

  private handleForbidden(): void {
    this.showErrorMessage('You do not have permission to access this resource.');
  }

  private handleNotFound(): void {
    this.showErrorMessage('The requested resource was not found.');
  }

  private handleServerError(): void {
    this.showErrorMessage('A server error occurred. Please try again later.');
  }

  private showErrorMessage(message: string): void {
    // You can integrate with a toast/notification service here
    console.error('Error:', message);
    
    // For now, we'll use a simple alert
    // In production, use a proper notification service like ngx-toastr
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`Error: ${message}`);
    }
  }

  private logError(errorInfo: ErrorInfo, context?: string): void {
    this.errorLog.push(errorInfo);
    
    // Keep only the last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (context) {
      console.error(`[${context}]`, errorInfo);
    } else {
      console.error('Application Error:', errorInfo);
    }

    // In production, you might want to send errors to a logging service
    // this.sendErrorToLoggingService(errorInfo);
  }

  getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  getRecentErrors(count: number = 10): ErrorInfo[] {
    return this.errorLog.slice(-count);
  }

  hasErrors(): boolean {
    return this.errorLog.length > 0;
  }

  getErrorCount(): number {
    return this.errorLog.length;
  }

  // Method to send errors to external logging service (e.g., Sentry, LogRocket)
  private sendErrorToLoggingService(errorInfo: ErrorInfo): void {
    // Implementation for external logging service
    // Example with Sentry:
    // Sentry.captureException(new Error(errorInfo.message), {
    //   extra: {
    //     status: errorInfo.status,
    //     url: errorInfo.url,
    //     timestamp: errorInfo.timestamp
    //   }
    // });
  }
} 
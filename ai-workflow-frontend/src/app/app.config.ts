import { ApplicationConfig } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withDebugTracing()),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideAnimations()
  ]
};
import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { APP_ROUTES } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { httpCancelInterceptor } from './core/interceptors/http-cancel-interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error-interceptor';
import { HttpErrorHandlerService } from './core/services/http-error-handler-service';
import { PreloadLazyloadService } from './core/services/preload-lazyload-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: HttpErrorHandlerService },
    provideHttpClient( 
      withFetch(), 
      withInterceptors([
        authInterceptor, 
        httpCancelInterceptor, 
        httpErrorInterceptor
      ]) 
    ),
    provideRouter(
      APP_ROUTES, 
      withPreloading(PreloadLazyloadService), 
      withInMemoryScrolling({ scrollPositionRestoration: 'top'})
    ), 
  ]
};

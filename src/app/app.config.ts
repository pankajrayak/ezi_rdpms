import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { APP_ROUTES } from './app.routes';
import { authInterceptor, httpErrorInterceptor, httpCancelInterceptor, cachingInterceptor } from './core/interceptors';
import { HttpErrorHandlerService, PreloadLazyloadService } from './core/services';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: HttpErrorHandlerService },
    provideHttpClient( 
      withInterceptors([
        authInterceptor, 
        cachingInterceptor,
        httpErrorInterceptor,
        httpCancelInterceptor, 
      ]) 
    ),
    provideRouter(
      APP_ROUTES, 
      withPreloading(PreloadLazyloadService), 
      withInMemoryScrolling({ scrollPositionRestoration: 'top'})
    ), 
  ]
};

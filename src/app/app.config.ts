import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { APP_ROUTES } from './app.routes';
import { authInterceptor, httpCancelInterceptor, httpErrorInterceptor } from '@rdpms/core/interceptors';
import { HttpErrorHandlerService, PreloadLazyloadService } from '@rdpms/core/services';

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

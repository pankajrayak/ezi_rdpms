import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@rdpms/services';
import { IS_RETRY_ENABLED, RETRY_COUNT } from '@rdpms/shared/utility';
import { retry } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const isRetryEnabled = req.context.get(IS_RETRY_ENABLED);
  const maxRetries = req.context.get(RETRY_COUNT) ?? 0;
  
  let clonedReq = normalizeSlashes(req);
  clonedReq = addAuthToken(clonedReq);

  if(isRetryEnabled) {
    return next(clonedReq).pipe(retry(maxRetries))
  }
  return next(clonedReq);
};

export const normalizeSlashes = (request: HttpRequest<unknown>): HttpRequest<unknown> => {
  if (!request.url) return request;

  return request.clone({
    url: request.url.replace(/([^:]\/)\/+/g, '$1')
  });
}

export const addAuthToken = (request: HttpRequest<any>): HttpRequest<any> => {
    
    const authService = inject(AuthService);
    const token = authService.token();
    const isLoggedIn = authService.isLoggedIn();
    
    if(!isLoggedIn || !token) { return request; }

    return request.clone({ 
      headers: request.headers.set("Authorization", `Bearer ${token}`)
    });
  }

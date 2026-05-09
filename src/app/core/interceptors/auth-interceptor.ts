import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let clonedReq = normalizeSlashes(req);
  clonedReq = addAuthToken(req);
  return next(clonedReq);
};

export const normalizeSlashes = (request: HttpRequest<unknown>): HttpRequest<unknown> => {
  return request.clone({
    url: request.url.replace(/([^:]\/)\/+/g, '$1')
  });
}

export const addAuthToken = (request: HttpRequest<any>): HttpRequest<any> => {
    const platformId = inject(PLATFORM_ID);
    if(!isPlatformBrowser(platformId)){ return request; }

    const token = localStorage.getItem('token');
    if (!token?.length) { return request; }

    const headers = { Authorization: `Bearer ${token}`, ...request.headers }
    const clonedReq = token ? request.clone({ setHeaders: headers }) : request;

    return clonedReq;

    return request.clone({ 
      headers: request.headers.set("Authorization", `Bearer ${token}`)
    });
  }

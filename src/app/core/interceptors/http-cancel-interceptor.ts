import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpCancelService } from '../services/http-cancel-service';
import { takeUntil } from 'rxjs';

export const httpCancelInterceptor: HttpInterceptorFn = (req, next) => {
  const httpCancelService = inject(HttpCancelService);
  
  // Only GET request cancel
  if(req.method !== 'GET'){ return next(req); }
  
  return next(req).pipe(
    takeUntil(httpCancelService.onCancelRequests())
  );
};

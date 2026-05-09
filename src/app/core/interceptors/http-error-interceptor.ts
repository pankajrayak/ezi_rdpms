import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if(error.status === 401){
        router.navigate(['/login']);
      }
      else if(error.status === 403){
        router.navigate(['/access-denied']);
      }
      else if(error.error instanceof Blob && error.error.type === 'application/json'){
        return from(error.error.text()).pipe(
          switchMap((text: string) => {
            const parsedError = JSON.parse(text);
            return throwError(() => new HttpErrorResponse({
              ...error,
              error: parsedError,
              url: error.url || undefined,
              statusText: parsedError.message || error.statusText
            }));
          })
        )
      }

      return throwError(() => error)
    })
  );
};

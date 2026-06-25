import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '@rdpms/services';

export const authGuard = (route: any, params: any): boolean | UrlTree => {

  const router = inject(Router);
  const authService = inject(AuthService);
  
  const user = authService.currentUser() as any;
  
  if(user){ return true; }

  const returnUrl = Array.isArray(params) ? params.map(segment => segment.path).join('/') : params.url;

  return router.createUrlTree(['/login'],{ queryParams: { returnUrl: returnUrl } });

};

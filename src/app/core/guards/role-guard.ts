import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '@rdpms/services';

export const roleGuard = (route: any, params: any): boolean | UrlTree => {

  const router = inject(Router);
  const authService = inject(AuthService);
  
  const user = authService.currentUser() as any;
  
  const roles: string[] = route.data['roles'] || [];
  const hasRole = roles?.includes(user?.role);

  if(hasRole){ return true; }

  const returnUrl = Array.isArray(params) ? params.map(segment => segment.path).join('/') : params.url;
  
  return router.createUrlTree(['/access-denied'],{ queryParams: { returnUrl: returnUrl } });

};

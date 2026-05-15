import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@rdpms/core/services';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const authService = inject(AuthService);
  
  const user = authService.currentUser() as any;
  
  if(!user){ 
    return router.createUrlTree(['/login'],{
      queryParams: { returnUrl: state.url }
    });
  }

  const expectedRoles: string[] = route.data['expectedRoles'];
  const hasRole = expectedRoles?.includes(user.role);

  return hasRole ? true : router.parseUrl('/access-denied');

};

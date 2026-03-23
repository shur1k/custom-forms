import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const homeRedirectGuard: CanActivateFn = (): UrlTree => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  if (!token) return router.createUrlTree(['/login']);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'admin') return router.createUrlTree(['/home']);
    return router.createUrlTree(['/runtime']);
  } catch {
    return router.createUrlTree(['/login']);
  }
};

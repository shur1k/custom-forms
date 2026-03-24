import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const homeRedirectGuard: CanActivateFn = (): UrlTree => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  if (!token) return router.createUrlTree(['/login']);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'admin' || payload.role === 'superuser') return router.createUrlTree(['/home']);
    if (payload.role === 'user') return router.createUrlTree(['/runtime']);
    return router.createUrlTree(['/login']); // missing/unknown role — force re-login
  } catch {
    return router.createUrlTree(['/login']);
  }
};

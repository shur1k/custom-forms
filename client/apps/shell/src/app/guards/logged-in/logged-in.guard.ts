import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const loggedInGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'admin' || payload.role === 'superuser') return router.createUrlTree(['/home']);
    if (payload.role === 'user') return router.createUrlTree(['/runtime']);
    return true; // missing/unknown role — allow login page to re-authenticate
  } catch {
    return true;
  }
};

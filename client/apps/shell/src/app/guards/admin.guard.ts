import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  if (!token) return router.createUrlTree(['/login']);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'admin') return true;
  } catch {
    // invalid token
  }
  return router.createUrlTree(['/']);
};

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth.guard';

const runGuard = (): ReturnType<typeof authGuard> =>
  TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('returns true when a token is present', () => {
    localStorage.setItem('accessToken', 'tok');
    expect(runGuard()).toBe(true);
  });

  it('redirects to /login when no token', () => {
    const router = TestBed.inject(Router);
    const result = runGuard();
    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});

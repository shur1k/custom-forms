import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';

import { adminGuard } from './admin.guard';

const makeToken = (role: string): string => {
  const payload = btoa(JSON.stringify({ sub: '1', role }));
  return `header.${payload}.sig`;
};

const runGuard = (): ReturnType<typeof adminGuard> =>
  TestBed.runInInjectionContext(() =>
    adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );

describe('adminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('returns true when the token contains role=admin', () => {
    localStorage.setItem('accessToken', makeToken('admin'));
    expect(runGuard()).toBe(true);
  });

  it('redirects to /login when no token', () => {
    const router = TestBed.inject(Router);
    const result = runGuard();
    expect(result).toEqual(router.createUrlTree(['/login']));
  });

  it('redirects to /runtime when token has role=user', () => {
    localStorage.setItem('accessToken', makeToken('user'));
    const router = TestBed.inject(Router);
    const result = runGuard();
    expect(result).toEqual(router.createUrlTree(['/runtime']));
  });
});

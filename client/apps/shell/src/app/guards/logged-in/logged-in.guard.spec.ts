import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';

import { loggedInGuard } from './logged-in.guard';

const makeToken = (role: string): string => {
  const payload = btoa(JSON.stringify({ sub: '1', role }));
  return `header.${payload}.sig`;
};

const runGuard = (): ReturnType<typeof loggedInGuard> =>
  TestBed.runInInjectionContext(() =>
    loggedInGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );

describe('loggedInGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('allows navigation when no token', () => {
    expect(runGuard()).toBe(true);
  });

  it('redirects to /home for admin role', () => {
    localStorage.setItem('accessToken', makeToken('admin'));
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/home']));
  });

  it('redirects to /home for superuser role', () => {
    localStorage.setItem('accessToken', makeToken('superuser'));
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/home']));
  });

  it('redirects to /runtime for user role', () => {
    localStorage.setItem('accessToken', makeToken('user'));
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/runtime']));
  });

  it('allows navigation when token is malformed', () => {
    localStorage.setItem('accessToken', 'not.a.valid.jwt');
    expect(runGuard()).toBe(true);
  });

  it('allows navigation when token has no role field', () => {
    const payload = btoa(JSON.stringify({ sub: '1' }));
    localStorage.setItem('accessToken', `header.${payload}.sig`);
    expect(runGuard()).toBe(true);
  });
});

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';

import { homeRedirectGuard } from './home-redirect.guard';

const makeToken = (role: string): string => {
  const payload = btoa(JSON.stringify({ sub: '1', role }));
  return `header.${payload}.sig`;
};

const runGuard = (): ReturnType<typeof homeRedirectGuard> =>
  TestBed.runInInjectionContext(() =>
    homeRedirectGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );

describe('homeRedirectGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('redirects to /login when no token', () => {
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/login']));
  });

  it('redirects to /home for admin role', () => {
    localStorage.setItem('accessToken', makeToken('admin'));
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/home']));
  });

  it('redirects to /runtime for user role', () => {
    localStorage.setItem('accessToken', makeToken('user'));
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/runtime']));
  });

  it('redirects to /login when token is malformed', () => {
    localStorage.setItem('accessToken', 'not.a.valid.jwt');
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/login']));
  });
});

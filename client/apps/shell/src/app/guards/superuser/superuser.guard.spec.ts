import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';

import { superuserGuard } from './superuser.guard';

const makeToken = (role: string): string => {
  const payload = btoa(JSON.stringify({ sub: '1', role }));
  return `header.${payload}.sig`;
};

const runGuard = (): ReturnType<typeof superuserGuard> =>
  TestBed.runInInjectionContext(() =>
    superuserGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );

describe('superuserGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('returns true when the token contains role=superuser', () => {
    localStorage.setItem('accessToken', makeToken('superuser'));
    expect(runGuard()).toBe(true);
  });

  it('redirects to /login when no token', () => {
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/login']));
  });

  it('redirects to /runtime when token has role=user', () => {
    localStorage.setItem('accessToken', makeToken('user'));
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/runtime']));
  });

  it('redirects to /runtime when token has role=admin', () => {
    localStorage.setItem('accessToken', makeToken('admin'));
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/runtime']));
  });

  it('redirects to /runtime when token is malformed', () => {
    localStorage.setItem('accessToken', 'not.a.valid.jwt');
    const router = TestBed.inject(Router);
    expect(runGuard()).toEqual(router.createUrlTree(['/runtime']));
  });
});

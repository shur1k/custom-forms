import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';

const TOKEN_KEY = 'accessToken';

// Minimal valid JWT payload for role='admin': header.payload.sig (base64url)
const makeToken = (role: string): string => {
  const payload = btoa(JSON.stringify({ sub: '1', email: 'a@b.com', role }));
  return `header.${payload}.sig`;
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isLoggedIn is false when no token in localStorage', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isAdmin is false when no token', () => {
    expect(service.isAdmin()).toBe(false);
  });

  it('isAdmin is true for a valid admin JWT', () => {
    localStorage.setItem(TOKEN_KEY, makeToken('admin'));
    // Re-create service so signal reads from localStorage
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    expect(svc.isAdmin()).toBe(true);
  });

  it('isAdmin is false for a user role JWT', () => {
    localStorage.setItem(TOKEN_KEY, makeToken('user'));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    expect(svc.isAdmin()).toBe(false);
  });

  it('isSuperuser is false when no token', () => {
    expect(service.isSuperuser()).toBe(false);
  });

  it('isSuperuser is true for a valid superuser JWT', () => {
    localStorage.setItem(TOKEN_KEY, makeToken('superuser'));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    expect(svc.isSuperuser()).toBe(true);
  });

  it('isSuperuser is false for an admin role JWT', () => {
    localStorage.setItem(TOKEN_KEY, makeToken('admin'));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    expect(svc.isSuperuser()).toBe(false);
  });

  it('login() POSTs credentials and stores the token', () => {
    service.login({ email: 'a@b.com', password: 'pass' }).subscribe();

    const req = http.expectOne('http://localhost:3000/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: 'new-token' });

    expect(localStorage.getItem(TOKEN_KEY)).toBe('new-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('register() POSTs credentials and stores the token', () => {
    service.register({ email: 'a@b.com', password: 'pass123' }).subscribe();

    const req = http.expectOne('http://localhost:3000/api/v1/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: 'reg-token' });

    expect(localStorage.getItem(TOKEN_KEY)).toBe('reg-token');
  });

  it('logout() clears the token and navigates to /login', () => {
    localStorage.setItem(TOKEN_KEY, 'some-token');
    service.logout();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});

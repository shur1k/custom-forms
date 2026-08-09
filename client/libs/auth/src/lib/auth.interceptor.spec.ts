import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const makeNext =
    (): HttpHandlerFn =>
    (req: HttpRequest<unknown>) =>
      of(new HttpResponse({ status: 200, body: req }));

  afterEach(() => {
    localStorage.clear();
  });

  it('adds Authorization header when token is present in localStorage', () => {
    localStorage.setItem('accessToken', 'test-token');
    const req = new HttpRequest('GET', '/api/test');
    let captured: HttpRequest<unknown> | undefined;

    authInterceptor(req, (r) => {
      captured = r as HttpRequest<unknown>;
      return makeNext()(r);
    });

    expect(captured?.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('does not add Authorization header when no token in localStorage', () => {
    const req = new HttpRequest('GET', '/api/test');
    let captured: HttpRequest<unknown> | undefined;

    authInterceptor(req, (r) => {
      captured = r as HttpRequest<unknown>;
      return makeNext()(r);
    });

    expect(captured?.headers.has('Authorization')).toBe(false);
  });

  it('forwards the request unchanged when no token', () => {
    const req = new HttpRequest('GET', '/api/test');
    let passedReq: HttpRequest<unknown> | undefined;

    authInterceptor(req, (r) => {
      passedReq = r as HttpRequest<unknown>;
      return makeNext()(r);
    });

    expect(passedReq).toBe(req);
  });
});

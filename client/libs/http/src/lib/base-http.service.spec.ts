import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-base-url.token';
import { BaseHttpService } from './base-http.service';

const BASE = 'http://test';

describe('BaseHttpService', () => {
  let service: BaseHttpService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
      ],
    });
    service = TestBed.inject(BaseHttpService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GET prepends base URL', () => {
    service.get('/items').subscribe();
    http.expectOne(`${BASE}/items`).flush([]);
  });

  it('POST prepends base URL', () => {
    service.post('/items', { name: 'x' }).subscribe();
    const req = http.expectOne(`${BASE}/items`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('PATCH prepends base URL', () => {
    service.patch('/items/1', { name: 'y' }).subscribe();
    const req = http.expectOne(`${BASE}/items/1`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('DELETE prepends base URL', () => {
    service.delete('/items/1').subscribe();
    const req = http.expectOne(`${BASE}/items/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginDto, RegisterDto } from '@custom-forms/api-client';

const TOKEN_KEY = 'accessToken';
const API_BASE = 'http://localhost:3000/api/v1';

interface AuthResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY),
  );

  readonly isLoggedIn = computed(() => !!this._token());

  readonly isAdmin = computed(() => {
    const token = this._token();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin';
    } catch {
      return false;
    }
  });

  readonly isSuperuser = computed(() => {
    const token = this._token();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'superuser';
    } catch {
      return false;
    }
  });

  getToken(): string | null {
    return this._token();
  }

  login(data: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE}/auth/login`, data)
      .pipe(tap(({ accessToken }) => this.storeToken(accessToken)));
  }

  register(data: RegisterDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE}/auth/register`, data)
      .pipe(tap(({ accessToken }) => this.storeToken(accessToken)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }
}

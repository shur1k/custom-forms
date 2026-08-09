import { computed, Injectable, signal } from '@angular/core';

export const TOKEN_KEY = 'accessToken';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly isSuperuser = computed(() => this._decodeRole() === 'superuser');
  readonly isAdmin     = computed(() => this._decodeRole() === 'admin');

  setToken(value: string): void {
    localStorage.setItem(TOKEN_KEY, value);
    this.token.set(value);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }

  private _decodeRole(): string | null {
    const t = this.token();
    if (!t) return null;
    try { return JSON.parse(atob(t.split('.')[1])).role ?? null; }
    catch { return null; }
  }
}

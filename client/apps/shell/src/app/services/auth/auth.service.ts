import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginDto, RegisterDto } from '@custom-forms/api-client';
import { BaseHttpService } from '@custom-forms/http';
import { AuthStateService } from '@custom-forms/auth';

interface AuthResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http      = inject(BaseHttpService);
  private readonly router    = inject(Router);
  private readonly authState = inject(AuthStateService);

  readonly isLoggedIn  = computed(() => !!this.authState.token());
  readonly isAdmin     = this.authState.isAdmin;
  readonly isSuperuser = this.authState.isSuperuser;

  getToken(): string | null {
    return this.authState.token();
  }

  login(data: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/auth/login', data)
      .pipe(tap(({ accessToken }) => this.authState.setToken(accessToken)));
  }

  register(data: RegisterDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/auth/register', data)
      .pipe(tap(({ accessToken }) => this.authState.setToken(accessToken)));
  }

  logout(): void {
    this.authState.clearToken();
    this.router.navigate(['/login']);
  }
}

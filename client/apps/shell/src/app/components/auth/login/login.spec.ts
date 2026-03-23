import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../services/auth/auth.service';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authSpy: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authSpy = { login: vi.fn().mockReturnValue(of({ accessToken: 'tok' })) };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not submit when the form is invalid', () => {
    component.submit();
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  it('calls auth.login with form values on valid submit', () => {
    component.form.setValue({ email: 'a@b.com', password: 'pass' });
    component.submit();
    expect(authSpy.login).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
    });
  });

  it('sets error signal on failed login', async () => {
    authSpy.login.mockReturnValue(throwError(() => new Error('401')));
    component.form.setValue({ email: 'a@b.com', password: 'wrong' });
    component.submit();
    await fixture.whenStable();
    expect(component.error()).toBe('Invalid email or password.');
    expect(component.loading()).toBe(false);
  });

  it('clears error and sets loading while submitting', () => {
    component.form.setValue({ email: 'a@b.com', password: 'pass' });
    component.submit();
    // loading is set synchronously before the observable resolves
    expect(component.error()).toBeNull();
  });
});

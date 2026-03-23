import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../services/auth/auth.service';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authSpy: { register: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authSpy = { register: vi.fn().mockReturnValue(of({ accessToken: 'tok' })) };

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not submit when the form is invalid', () => {
    component.submit();
    expect(authSpy.register).not.toHaveBeenCalled();
  });

  it('calls auth.register with form values on valid submit', () => {
    component.form.setValue({ email: 'a@b.com', password: 'password1' });
    component.submit();
    expect(authSpy.register).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'password1',
    });
  });

  it('sets error signal on failed registration', async () => {
    authSpy.register.mockReturnValue(throwError(() => new Error('409')));
    component.form.setValue({ email: 'a@b.com', password: 'password1' });
    component.submit();
    await fixture.whenStable();
    expect(component.error()).toBe(
      'Registration failed. The email may already be in use.',
    );
    expect(component.loading()).toBe(false);
  });
});

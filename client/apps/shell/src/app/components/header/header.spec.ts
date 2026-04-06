import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let authSpy: { logout: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authSpy = { logout: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
  });

  it('should render brand link to /home', () => {
    const el = fixture.nativeElement as HTMLElement;
    const brand = el.querySelector('.app-header__brand');
    expect(brand?.textContent?.trim()).toBe('Custom Forms');
    expect(brand?.getAttribute('href')).toBe('/home');
  });

  it('should call auth.logout() when logout button clicked', () => {
    const btn = fixture.nativeElement.querySelector('.app-header__logout') as HTMLButtonElement;
    btn.click();
    expect(authSpy.logout).toHaveBeenCalledTimes(1);
  });
});

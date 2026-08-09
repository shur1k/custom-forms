import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'cf-root',
  imports: [RouterOutlet, Header],
  template: `
    @if (auth.isLoggedIn()) {
      <cf-header />
    }
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly auth = inject(AuthService);
}

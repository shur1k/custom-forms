import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseHttpService } from '@custom-forms/http';
import { Button } from '@custom-forms/ui';
import { PublishedFormRow } from '../form-schema.types';

@Component({
  selector: 'cf-form-list',
  templateUrl: './form-list.html',
  styleUrl: './form-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
})
export class FormList implements OnInit {
  private readonly http = inject(BaseHttpService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly forms = signal<PublishedFormRow[]>([]);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.http.get<PublishedFormRow[]>('/schemas/published').subscribe({
      next: (rows) => {
        this.forms.set(rows);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openForm(id: string): void {
    this.router.navigate(['form-viewer', id], { relativeTo: this.route });
  }
}

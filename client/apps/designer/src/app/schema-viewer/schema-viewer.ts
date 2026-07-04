import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SchemaRow } from '../form-schema.types';
import { BaseHttpService } from '@custom-forms/http';

@Component({
  selector: 'cf-schema-viewer',
  templateUrl: './schema-viewer.html',
  styleUrl: './schema-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class SchemaViewer implements OnInit {
  private readonly http  = inject(BaseHttpService);
  private readonly id    = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
  private readonly api   = `/schemas/${this.id}`;

  readonly row       = signal<SchemaRow | null>(null);
  readonly isLoading = signal(false);

  readonly prettySchema = computed(() =>
    JSON.stringify(this.row()?.schema ?? null, null, 2)
  );

  ngOnInit(): void {
    this.isLoading.set(true);
    this.http.get<SchemaRow>(this.api).subscribe({
      next: (res) => { this.row.set(res); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BaseHttpService } from '@custom-forms/http';
import { ComponentPalette } from './component-palette/component-palette';
import { Canvas } from './canvas/canvas';
import { PropertiesPanel } from './properties-panel/properties-panel';
import {
  ComponentDef, SchemaRow,
  asCol, asColSpan, asRow, asRowSpan,
  schemaToComponents, componentsToSchema,
} from '../form-schema.types';

@Component({
  selector: 'cf-form-editor',
  templateUrl: './form-editor.html',
  styleUrl: './form-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ComponentPalette, Canvas, PropertiesPanel, RouterLink],
})
export class FormEditor implements OnInit {
  private readonly http  = inject(BaseHttpService);
  private readonly route = inject(ActivatedRoute);
  private readonly id    = this.route.snapshot.paramMap.get('id')!;
  private readonly api   = `/schemas/${this.id}`;

  readonly components = signal<ComponentDef[]>([]);
  readonly formTitle  = signal('');
  readonly formType   = signal('');
  readonly isLoading  = signal(false);
  readonly isSaving   = signal(false);
  readonly selectedId = signal<string | null>(null);

  readonly selectedComp = computed(() =>
    this.components().find((c) => c.id === this.selectedId()) ?? null
  );

  ngOnInit(): void {
    this.isLoading.set(true);
    this.http.get<SchemaRow>(this.api).subscribe({
      next: (res) => {
        this.formTitle.set(res.title);
        this.formType.set(res.type.name);
        this.components.set(schemaToComponents(res.schema));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  save(): void {
    this.isSaving.set(true);
    const schema = componentsToSchema(this.components(), this.formTitle());
    this.http.patch(this.api, { schema }).subscribe({
      next: () => this.isSaving.set(false),
      error: () => this.isSaving.set(false),
    });
  }

  onComponentDropped(def: ComponentDef): void {
    this.components.update((cs) => [...cs, def]);
    this.selectedId.set(def.id);
  }

  onComponentMoved(event: { id: string; col: number; row: number }): void {
    this.components.update((cs) => cs.map((c) =>
      c.id === event.id ? { ...c, col: asCol(event.col), row: asRow(event.row) } : c
    ));
  }

  onComponentResized(event: { id: string; w: number; h: number }): void {
    this.components.update((cs) => cs.map((c) =>
      c.id === event.id ? { ...c, w: asColSpan(event.w), h: asRowSpan(event.h) } : c
    ));
  }

  onComponentRemoved(id: string): void {
    this.components.update((cs) => cs.filter((c) => c.id !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  onComponentSelected(id: string): void {
    this.selectedId.set(id);
  }

  onPropsChanged(updated: ComponentDef): void {
    this.components.update((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
  }
}

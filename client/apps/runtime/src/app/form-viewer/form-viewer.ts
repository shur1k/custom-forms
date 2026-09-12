import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BaseHttpService } from '@custom-forms/http';
import {
  Button,
  Input,
  Select,
  SelectOption,
  TextArea,
} from '@custom-forms/ui';
import { StoredSchema } from '../form-schema.types';

export const GRID_COLS = 64;

interface RenderableField {
  kind: 'input' | 'select' | 'text-area';
  label: string;
  showTitle: boolean;
  disabled: boolean;
  textColor: string;
  col: number;
  row: number;
  w: number;
  h: number;
  options: SelectOption[];
}

interface RenderableAction {
  kind: 'button';
  label: string;
  disabled: boolean;
  textColor: string;
  col: number;
  row: number;
  w: number;
  h: number;
}

type RenderableView = RenderableField | RenderableAction;

type RenderResult =
  | { id: string; ok: true; view: RenderableView }
  | { id: string; ok: false; errorMessage: string };

@Component({
  selector: 'cf-form-viewer',
  templateUrl: './form-viewer.html',
  styleUrl: './form-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Input, Select, TextArea, Button],
})
export class FormViewer implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(BaseHttpService);

  readonly schemaId = signal('');
  readonly storedSchema = signal<StoredSchema | null>(null);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly gridCols = GRID_COLS;

  readonly renderItems = computed<RenderResult[]>(() => {
    const schema = this.storedSchema();
    if (!schema) return [];

    const results: RenderResult[] = [];
    for (const [id, prop] of Object.entries(schema.properties ?? {})) {
      results.push(this.resolveField(id, prop));
    }
    for (const action of schema['x-actions'] ?? []) {
      results.push(this.resolveAction(action));
    }
    return results;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('schemaId') ?? '';
    this.schemaId.set(id);
    this.isLoading.set(true);

    this.http
      .get<{
        schema: { schema: StoredSchema } | null;
        values: Record<string, unknown> | null;
      }>(`/schemas/${id}/forms-data`)
      .subscribe({
        next: (res) => {
          this.storedSchema.set(res.schema?.schema ?? null);
          this.isLoading.set(false);
        },
        error: () => {
          this.loadError.set('This form is not available.');
          this.isLoading.set(false);
        },
      });
  }

  itemStyle(view: {
    col: number;
    row: number;
    w: number;
    h: number;
  }): Record<string, string> {
    return {
      'grid-column': `${view.col + 1} / span ${view.w}`,
      'grid-row': `${view.row + 1} / span ${view.h}`,
    };
  }

  private resolveField(
    id: string,
    prop: StoredSchema['properties'][string],
  ): RenderResult {
    try {
      const ui = prop?.['x-ui'];
      if (!ui) {
        throw new Error(`Component "${id}" is missing its layout definition`);
      }
      if (
        ui.component !== 'input' &&
        ui.component !== 'select' &&
        ui.component !== 'text-area'
      ) {
        throw new Error(`Component "${id}" has an unrecognized type`);
      }

      return {
        id,
        ok: true,
        view: {
          kind: ui.component,
          label: prop.title ?? id,
          showTitle: ui.showTitle,
          disabled: ui.disabled,
          textColor: ui.textColor,
          col: ui.col,
          row: ui.row,
          w: ui.w,
          h: ui.h,
          options: (prop.enum ?? []).map((value) => ({ value, label: value })),
        },
      };
    } catch (err) {
      return {
        id,
        ok: false,
        errorMessage:
          err instanceof Error ? err.message : 'Failed to render this field',
      };
    }
  }

  private resolveAction(
    action: StoredSchema['x-actions'][number],
  ): RenderResult {
    const id = action?.id ?? 'unknown-action';
    try {
      if (!action?.id || !action.label) {
        throw new Error('This action is missing required fields');
      }

      return {
        id: action.id,
        ok: true,
        view: {
          kind: 'button',
          label: action.label,
          disabled: action.disabled,
          textColor: action.textColor,
          col: action.col,
          row: action.row,
          w: action.w,
          h: action.h,
        },
      };
    } catch (err) {
      return {
        id,
        ok: false,
        errorMessage:
          err instanceof Error ? err.message : 'Failed to render this action',
      };
    }
  }
}

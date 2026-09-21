import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
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
import { ItemErrorBoundary } from './item-error-boundary';

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
  imports: [
    Input,
    Select,
    TextArea,
    Button,
    ReactiveFormsModule,
    ItemErrorBoundary,
  ],
})
export class FormViewer implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(BaseHttpService);

  readonly schemaId = signal('');
  readonly storedSchema = signal<StoredSchema | null>(null);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly priorValues = signal<Record<string, unknown> | null>(null);
  readonly submitMessage = signal<string | null>(null);

  readonly gridCols = GRID_COLS;
  readonly gridRef = viewChild<ElementRef<HTMLDivElement>>('gridEl');

  /** Row height in px, kept equal to the column width — mirrors Designer's
   * canvas so a component's stored (row, h) renders at the same relative
   * position it had when it was placed. */
  readonly cellSize = signal(40);

  form = new FormGroup<Record<string, FormControl<string>>>({});

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

  constructor() {
    effect((onCleanup) => {
      const gridEl = this.gridRef()?.nativeElement;
      if (!gridEl) return;

      const updateCellSize = (): void =>
        this.cellSize.set(gridEl.getBoundingClientRect().width / GRID_COLS);
      updateCellSize();

      const observer = new ResizeObserver(updateCellSize);
      observer.observe(gridEl);
      onCleanup(() => observer.disconnect());
    });

    effect(() => {
      const controls = this.buildControls(this.renderItems());
      const prior = this.priorValues();
      if (prior) {
        for (const [id, control] of Object.entries(controls)) {
          const value = prior[id];
          if (typeof value === 'string') control.setValue(value);
        }
      }
      this.form = new FormGroup(controls);
    });
  }

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
          this.priorValues.set(res.values ?? null);
          this.isLoading.set(false);
        },
        error: () => {
          this.loadError.set('This form is not available.');
          this.isLoading.set(false);
        },
      });
  }

  onSubmitClick(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitMessage.set(null);
    this.http
      .put(`/schemas/${this.schemaId()}/forms-data`, {
        values: this.form.getRawValue(),
      })
      .subscribe({
        next: () => this.submitMessage.set('Submitted — your data was saved.'),
        error: () => this.submitMessage.set('Submit failed. Please try again.'),
      });
  }

  onDeleteClick(): void {
    this.submitMessage.set(null);
    this.http.delete(`/schemas/${this.schemaId()}/forms-data`).subscribe({
      next: () => {
        this.form.reset();
        this.submitMessage.set('Your data was deleted.');
      },
      error: () => this.submitMessage.set('Delete failed. Please try again.'),
    });
  }

  fieldError(id: string): string | null {
    const control = this.form.controls[id];
    if (!control || !control.touched || control.valid) return null;
    if (control.errors?.['required']) return 'This field is required';
    if (control.errors?.['invalidOption'])
      return 'Please choose a valid option';
    return 'Invalid value';
  }

  private buildControls(
    items: RenderResult[],
  ): Record<string, FormControl<string>> {
    const required = this.storedSchema()?.required ?? [];
    const controls: Record<string, FormControl<string>> = {};

    for (const item of items) {
      if (!item.ok || item.view.kind === 'button') continue;

      const validators: ValidatorFn[] = [];
      if (required.includes(item.id)) validators.push(Validators.required);
      if (item.view.kind === 'select' && item.view.options.length > 0) {
        const allowed = item.view.options.map((option) => option.value);
        validators.push((control) =>
          control.value && !allowed.includes(control.value)
            ? { invalidOption: true }
            : null,
        );
      }

      controls[item.id] = new FormControl('', {
        nonNullable: true,
        validators,
      });
    }

    return controls;
  }

  itemStyle(view: {
    col: number;
    row: number;
    w: number;
    h: number;
    textColor?: string;
  }): Record<string, string> {
    const style: Record<string, string> = {
      'grid-column': `${view.col + 1} / span ${view.w}`,
      'grid-row': `${view.row + 1} / span ${view.h}`,
    };
    if (view.textColor) style['color'] = view.textColor;
    return style;
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

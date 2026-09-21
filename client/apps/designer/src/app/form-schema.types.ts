export type ComponentType = 'input' | 'select' | 'button' | 'text-area';

export type Col = number;
export type ColSpan = number;

declare const _rowBrand: unique symbol;
declare const _rowSpanBrand: unique symbol;
export type RowIndex = number & { readonly [_rowBrand]: 'RowIndex' };
export type RowSpan = number & { readonly [_rowSpanBrand]: 'RowSpan' };

export const asCol = (n: number): Col => n as Col;
export const asColSpan = (n: number): ColSpan => n as ColSpan;
export const asRow = (n: number): RowIndex => n as RowIndex;
export const asRowSpan = (n: number): RowSpan => n as RowSpan;

export interface SelectChoice {
  value: string;
  label: string;
}

export interface ComponentProps {
  label: string;
  showTitle: boolean;
  disabled: boolean;
  textColor: string;
  choices: SelectChoice[];
}

export interface ComponentDef {
  id: string;
  type: ComponentType;
  col: Col;
  row: RowIndex;
  w: ColSpan;
  h: RowSpan;
  props: ComponentProps;
}

// ── JSON Schema (stored in DB) ────────────────────────────────────────────────

interface XUi {
  component: 'input' | 'select' | 'text-area';
  col: number;
  row: number;
  w: number;
  h: number;
  showTitle: boolean;
  disabled: boolean;
  textColor: string;
}

interface XAction {
  id: string;
  label: string;
  col: number;
  row: number;
  w: number;
  h: number;
  disabled: boolean;
  textColor: string;
}

export interface StoredSchema {
  $schema: 'https://json-schema.org/draft/2020-12/schema';
  type: 'object';
  title: string;
  properties: Record<
    string,
    {
      type: 'string';
      title: string;
      enum?: string[];
      'x-enum-labels'?: string[];
      'x-ui': XUi;
    }
  >;
  'x-actions': XAction[];
  required: string[];
}

/** Convert DB-stored JSON Schema → internal ComponentDef[] for the canvas. */
export function schemaToComponents(
  schema: StoredSchema | null,
): ComponentDef[] {
  if (!schema) return [];
  const result: ComponentDef[] = [];

  for (const [id, prop] of Object.entries(schema.properties ?? {})) {
    const ui = prop['x-ui'];
    if (!ui) continue;
    result.push({
      id,
      type: ui.component,
      col: asCol(ui.col ?? 0),
      row: asRow(ui.row ?? 0),
      w: asColSpan(ui.w ?? 12),
      h: asRowSpan(ui.h ?? 4),
      props: {
        label: prop.title ?? '',
        showTitle: ui.showTitle ?? true,
        disabled: ui.disabled ?? false,
        textColor: ui.textColor ?? '#000000',
        choices: (prop.enum ?? []).map((value, i) => ({
          value,
          label: prop['x-enum-labels']?.[i] ?? value,
        })),
      },
    });
  }

  for (const action of schema['x-actions'] ?? []) {
    result.push({
      id: action.id,
      type: 'button',
      col: asCol(action.col ?? 0),
      row: asRow(action.row ?? 0),
      w: asColSpan(action.w ?? 8),
      h: asRowSpan(action.h ?? 4),
      props: {
        label: action.label ?? 'Button',
        showTitle: true,
        disabled: action.disabled ?? false,
        textColor: action.textColor ?? '#000000',
        choices: [],
      },
    });
  }

  return result;
}

/** Convert internal ComponentDef[] → JSON Schema for DB storage. */
export function componentsToSchema(
  components: ComponentDef[],
  title: string,
): StoredSchema {
  const properties: StoredSchema['properties'] = {};
  const actions: XAction[] = [];

  for (const comp of components) {
    if (comp.type === 'button') {
      actions.push({
        id: comp.id,
        label: comp.props.label,
        col: comp.col,
        row: comp.row,
        w: comp.w,
        h: comp.h,
        disabled: comp.props.disabled,
        textColor: comp.props.textColor,
      });
    } else {
      const choices = comp.props.choices.filter((c) => c.value.trim() !== '');
      properties[comp.id] = {
        type: 'string',
        title: comp.props.label,
        ...(comp.type === 'select'
          ? {
              enum: choices.map((c) => c.value),
              'x-enum-labels': choices.map((c) => c.label || c.value),
            }
          : {}),
        'x-ui': {
          component: comp.type,
          col: comp.col,
          row: comp.row,
          w: comp.w,
          h: comp.h,
          showTitle: comp.props.showTitle,
          disabled: comp.props.disabled,
          textColor: comp.props.textColor,
        },
      };
    }
  }

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    title,
    properties,
    'x-actions': actions,
    required: [],
  };
}

// ── API row shape ─────────────────────────────────────────────────────────────

export interface SchemaRow {
  id: string;
  title: string;
  type: { name: string };
  createdAt: string;
  schema: StoredSchema | null;
  owner?: { email: string };
}

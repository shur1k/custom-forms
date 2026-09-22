// Runtime's own minimal read-side view of the JSON Schema Designer stores —
// only what's needed to discover, render, and validate a published form.

export interface PublishedFormRow {
  id: string;
  title: string;
  type: { name: string };
}

export interface XUi {
  component: 'input' | 'select' | 'text-area';
  col: number;
  row: number;
  w: number;
  h: number;
  showTitle: boolean;
  disabled: boolean;
  textColor: string;
}

export interface XAction {
  id: string;
  label: string;
  col: number;
  row: number;
  w: number;
  h: number;
  disabled: boolean;
  textColor: string;
  bgColor: string;
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

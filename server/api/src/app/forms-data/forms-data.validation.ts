interface FormFieldSchema {
  type?: string;
  enum?: string[];
}

interface FormSchema {
  properties?: Record<string, FormFieldSchema>;
  required?: string[];
}

/**
 * AC-18: required-field + type checks against the schema's field
 * definitions (only `string`, optionally `enum`-constrained, per
 * Designer's current component kit). Returns one message per failing
 * field id, empty when the submission is valid.
 */
export function validateFormValues(
  schema: FormSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of schema.required ?? []) {
    const value = values?.[field];
    if (value === undefined || value === null || value === '') {
      errors[field] = 'This field is required';
    }
  }

  for (const [field, prop] of Object.entries(schema.properties ?? {})) {
    if (field in errors) continue;
    const value = values?.[field];
    if (value === undefined || value === null) continue;

    if (prop.type === 'string' && typeof value !== 'string') {
      errors[field] = 'Expected a string value';
      continue;
    }
    if (prop.enum && !prop.enum.includes(value)) {
      errors[field] = `Must be one of: ${prop.enum.join(', ')}`;
    }
  }

  return errors;
}

/**
 * Drops keys not declared in the schema's field ids, per data-model.md's
 * "keyed like the schema's component ids" contract for `forms_data.values`.
 */
export function sanitizeFormValues(
  schema: FormSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  const allowedKeys = new Set(Object.keys(schema.properties ?? {}));
  return Object.fromEntries(
    Object.entries(values ?? {}).filter(([key]) => allowedKeys.has(key)),
  );
}

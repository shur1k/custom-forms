import {
  sanitizeFormValues,
  validateFormValues,
} from './forms-data.validation';

const schema = {
  properties: {
    name: { type: 'string', title: 'Name' },
    role: { type: 'string', title: 'Role', enum: ['admin', 'user'] },
  },
  required: ['name'],
};

describe('validateFormValues', () => {
  it('returns no errors for a fully valid submission', () => {
    expect(
      validateFormValues(schema, { name: 'Alice', role: 'admin' }),
    ).toEqual({});
  });

  it('flags a missing required field', () => {
    const errors = validateFormValues(schema, { role: 'admin' });
    expect(errors).toHaveProperty('name');
  });

  it('flags an empty-string required field', () => {
    const errors = validateFormValues(schema, { name: '' });
    expect(errors).toHaveProperty('name');
  });

  it('flags a value outside the field enum', () => {
    const errors = validateFormValues(schema, {
      name: 'Alice',
      role: 'superuser',
    });
    expect(errors).toHaveProperty('role');
  });

  it('allows an empty optional enum field left unselected', () => {
    const errors = validateFormValues(schema, { name: 'Alice', role: '' });
    expect(errors).toEqual({});
  });

  it('allows any value for an enum field with no configured options', () => {
    const schemaWithEmptyEnum = {
      properties: {
        name: { type: 'string', title: 'Name' },
        role: { type: 'string', title: 'Role', enum: [] },
      },
      required: ['name'],
    };
    const errors = validateFormValues(schemaWithEmptyEnum, {
      name: 'Alice',
      role: '',
    });
    expect(errors).toEqual({});
  });

  it('flags a non-string value for a string field', () => {
    const errors = validateFormValues(schema, { name: 42 });
    expect(errors).toHaveProperty('name');
  });

  it('treats an empty schema as always valid', () => {
    expect(validateFormValues({}, { anything: 'goes' })).toEqual({});
  });
});

describe('sanitizeFormValues', () => {
  it('drops keys not declared in the schema', () => {
    const result = sanitizeFormValues(schema, {
      name: 'Alice',
      role: 'admin',
      evilPayload: 'x'.repeat(10_000),
    });
    expect(result).toEqual({ name: 'Alice', role: 'admin' });
  });

  it('keeps every key that is declared in the schema', () => {
    const result = sanitizeFormValues(schema, {
      name: 'Alice',
      role: 'admin',
    });
    expect(result).toEqual({ name: 'Alice', role: 'admin' });
  });

  it('returns an empty object when the schema declares no properties', () => {
    expect(sanitizeFormValues({}, { anything: 'goes' })).toEqual({});
  });
});

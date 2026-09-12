import { validateFormValues } from './forms-data.validation';

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

  it('flags a non-string value for a string field', () => {
    const errors = validateFormValues(schema, { name: 42 });
    expect(errors).toHaveProperty('name');
  });

  it('treats an empty schema as always valid', () => {
    expect(validateFormValues({}, { anything: 'goes' })).toEqual({});
  });
});

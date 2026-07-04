import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { API_BASE_URL } from '@custom-forms/http';
import { FormEditor } from './form-editor';
import { ComponentDef, asCol, asColSpan, asRow, asRowSpan, componentsToSchema } from '../form-schema.types';

const SCHEMA_ID = 'form-123';
const BASE      = 'http://test.example.com/api';
const API       = `${BASE}/schemas/${SCHEMA_ID}`;

const makeComp = (overrides: Partial<ComponentDef> = {}): ComponentDef => ({
  id: 'comp-1',
  type: 'input',
  col: asCol(0),
  row: asRow(0),
  w: asColSpan(3),
  h: asRowSpan(1),
  props: { label: 'Input', showTitle: true, disabled: false, textColor: '#000000' },
  ...overrides,
});

const mockSchemaRow = {
  id: SCHEMA_ID,
  title: 'Test Form',
  type: { name: 'form' },
  createdAt: '2026-01-01T00:00:00Z',
  schema: null,
};

describe('FormEditor', () => {
  let fixture: ComponentFixture<FormEditor>;
  let component: FormEditor;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormEditor],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => SCHEMA_ID } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormEditor);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads schema on init via GET', () => {
    fixture.detectChanges();
    http.expectOne(API).flush(mockSchemaRow);

    expect(component.formTitle()).toBe('Test Form');
    expect(component.formType()).toBe('form');
    expect(component.components()).toEqual([]);
    expect(component.isLoading()).toBe(false);
  });

  it('calls PATCH on save() with JSON Schema body', () => {
    fixture.detectChanges();
    http.expectOne(API).flush(mockSchemaRow);

    component.save();
    const req = http.expectOne({ method: 'PATCH', url: API });
    expect(req.request.body).toEqual({ schema: componentsToSchema([], 'Test Form') });
    req.flush({});

    expect(component.isSaving()).toBe(false);
  });

  it('appends component and selects it on onComponentDropped()', () => {
    fixture.detectChanges();
    http.expectOne(API).flush(mockSchemaRow);

    const comp = makeComp();
    component.onComponentDropped(comp);

    expect(component.components()).toEqual([comp]);
    expect(component.selectedId()).toBe('comp-1');
  });

  it('updates component position on onComponentMoved()', () => {
    const storedSchema = componentsToSchema([makeComp()], 'Test Form');
    fixture.detectChanges();
    http.expectOne(API).flush({ ...mockSchemaRow, schema: storedSchema });

    component.onComponentMoved({ id: 'comp-1', col: 4, row: 2 });

    const comp = component.components()[0];
    expect(comp.col).toBe(4);
    expect(comp.row).toBe(2);
  });

  it('updates component size on onComponentResized()', () => {
    const storedSchema = componentsToSchema([makeComp()], 'Test Form');
    fixture.detectChanges();
    http.expectOne(API).flush({ ...mockSchemaRow, schema: storedSchema });

    component.onComponentResized({ id: 'comp-1', w: 6, h: 2 });

    const comp = component.components()[0];
    expect(comp.w).toBe(6);
    expect(comp.h).toBe(2);
  });

  it('sets selectedId on onComponentSelected()', () => {
    fixture.detectChanges();
    http.expectOne(API).flush(mockSchemaRow);

    component.onComponentSelected('some-id');
    expect(component.selectedId()).toBe('some-id');
  });

  it('removes component on onComponentRemoved()', () => {
    const storedSchema = componentsToSchema([makeComp()], 'Test Form');
    fixture.detectChanges();
    http.expectOne(API).flush({ ...mockSchemaRow, schema: storedSchema });

    component.onComponentRemoved('comp-1');

    expect(component.components()).toEqual([]);
  });

  it('clears selectedId when the removed component was selected', () => {
    const storedSchema = componentsToSchema([makeComp()], 'Test Form');
    fixture.detectChanges();
    http.expectOne(API).flush({ ...mockSchemaRow, schema: storedSchema });

    component.onComponentSelected('comp-1');
    expect(component.selectedId()).toBe('comp-1');

    component.onComponentRemoved('comp-1');
    expect(component.selectedId()).toBeNull();
  });

  it('replaces component on onPropsChanged()', () => {
    const storedSchema = componentsToSchema([makeComp()], 'Test Form');
    fixture.detectChanges();
    http.expectOne(API).flush({ ...mockSchemaRow, schema: storedSchema });

    const updated = makeComp({ props: { label: 'Updated', showTitle: false, disabled: true, textColor: '#ef4444' } });
    component.onPropsChanged(updated);

    expect(component.components()[0].props.label).toBe('Updated');
  });
});

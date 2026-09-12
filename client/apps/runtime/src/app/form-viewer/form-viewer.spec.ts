import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { StoredSchema } from '../form-schema.types';
import { FormViewer } from './form-viewer';

const SCHEMA_ID = 'schema-1';
const API = `http://localhost:3000/api/v1/schemas/${SCHEMA_ID}/forms-data`;

const baseXUi = {
  col: 0,
  row: 0,
  w: 12,
  h: 4,
  showTitle: true,
  disabled: false,
  textColor: '#000000',
};

const buildSchema = (properties: StoredSchema['properties']): StoredSchema => ({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'Test Form',
  properties,
  'x-actions': [],
  required: [],
});

describe('FormViewer', () => {
  let fixture: ComponentFixture<FormViewer>;
  let component: FormViewer;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormViewer],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => SCHEMA_ID } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormViewer);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("positions a field according to the schema's col/row/w/h layout", () => {
    const schema = buildSchema({
      name: {
        type: 'string',
        title: 'Name',
        'x-ui': { ...baseXUi, component: 'input', col: 4, row: 2, w: 10, h: 3 },
      },
    });

    fixture.detectChanges();
    http.expectOne(API).flush({ schema: { schema }, values: null });
    fixture.detectChanges();

    const results = component.renderItems();
    expect(results).toHaveLength(1);
    expect(results[0].ok).toBe(true);
    const style = component.itemStyle(
      (
        results[0] as {
          view: { col: number; row: number; w: number; h: number };
        }
      ).view,
    );
    expect(style['grid-column']).toBe('5 / span 10');
    expect(style['grid-row']).toBe('3 / span 3');
  });

  it('shows a visible error placeholder for a component with a broken binding, without breaking the rest of the form (AC-16)', () => {
    const schema = buildSchema({
      broken: {
        type: 'string',
        title: 'Broken',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'x-ui': undefined as any,
      },
      valid: {
        type: 'string',
        title: 'Valid',
        'x-ui': { ...baseXUi, component: 'input' },
      },
    });

    fixture.detectChanges();
    http.expectOne(API).flush({ schema: { schema }, values: null });
    fixture.detectChanges();

    const results = component.renderItems();
    const broken = results.find((r) => r.id === 'broken');
    const valid = results.find((r) => r.id === 'valid');

    expect(broken?.ok).toBe(false);
    expect(valid?.ok).toBe(true);

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('valid');
  });

  it('never renders a label as active markup — a malicious title stays literal text (AC-15)', () => {
    const maliciousTitle = '<img src=x onerror=alert(1)>';
    const schema = buildSchema({
      name: {
        type: 'string',
        title: maliciousTitle,
        'x-ui': { ...baseXUi, component: 'input' },
      },
    });

    fixture.detectChanges();
    http.expectOne(API).flush({ schema: { schema }, values: null });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain(maliciousTitle);
  });

  it('shows an error message when the form is not published (AC-14)', () => {
    fixture.detectChanges();
    http.expectOne(API).flush(null, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(component.loadError()).toBeTruthy();
    expect(component.isLoading()).toBe(false);
  });
});

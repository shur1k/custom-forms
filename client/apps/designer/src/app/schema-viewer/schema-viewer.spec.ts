import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { SchemaViewer } from './schema-viewer';

const SCHEMA_ID = 'form-456';
const API = `http://localhost:3000/api/v1/schemas/${SCHEMA_ID}`;

const mockRow = {
  id: SCHEMA_ID,
  title: 'Test Form',
  type: { name: 'form' },
  createdAt: '2026-01-01T00:00:00Z',
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    title: 'Test Form',
    properties: {
      'abc-123': {
        type: 'string',
        title: 'Name',
        'x-ui': { component: 'input', col: 0, row: 0, w: 3, h: 1, showTitle: true, disabled: false, textColor: '#000000' },
      },
    },
    'x-actions': [],
    required: [],
  },
};

describe('SchemaViewer', () => {
  let fixture: ComponentFixture<SchemaViewer>;
  let component: SchemaViewer;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaViewer],
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

    fixture = TestBed.createComponent(SchemaViewer);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shows loading state while fetching', () => {
    fixture.detectChanges();
    expect(component.isLoading()).toBe(true);
    http.expectOne(API).flush(mockRow);
  });

  it('loads and sets row on init', () => {
    fixture.detectChanges();
    http.expectOne(API).flush(mockRow);
    expect(component.row()).toEqual(mockRow as any);
    expect(component.isLoading()).toBe(false);
  });

  it('prettySchema returns the stored schema as formatted JSON', () => {
    fixture.detectChanges();
    http.expectOne(API).flush(mockRow);
    expect(component.prettySchema()).toBe(JSON.stringify(mockRow.schema, null, 2));
  });
});

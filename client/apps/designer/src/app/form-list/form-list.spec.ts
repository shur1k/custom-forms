import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';

import { FormList } from './form-list';
import { SchemaRow } from '../form-schema.types';

const API = 'http://localhost:3000/api/v1/schemas';

const mockRow: SchemaRow = {
  id: 'schema-1',
  title: 'Test Form',
  type: { name: 'form' },
  createdAt: '2026-01-01T00:00:00Z',
  schema: null,
};

const makeSuperuserToken = () => {
  const payload = btoa(JSON.stringify({ role: 'superuser' }));
  return `header.${payload}.sig`;
};

describe('FormList', () => {
  let fixture: ComponentFixture<FormList>;
  let component: FormList;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormList],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormList);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches and displays schemas on init', () => {
    fixture.detectChanges();
    http.expectOne(API).flush([mockRow]);
    expect(component.rowData()).toEqual([mockRow]);
    expect(component.isLoading()).toBe(false);
  });

  it('opens new dialog on openNewDialog()', () => {
    fixture.detectChanges();
    http.expectOne(API).flush([]);
    component.openNewDialog();
    expect(component.showNewDialog()).toBe(true);
  });

  it('creates form via POST then reloads list via GET', () => {
    fixture.detectChanges();
    http.expectOne(API).flush([mockRow]);

    component.openNewDialog();
    component.newTitle.set('New Form');
    component.newType.set('form');
    component.confirmCreate();

    const newRow: SchemaRow = { ...mockRow, id: 'schema-2', title: 'New Form' };
    http.expectOne({ method: 'POST', url: API }).flush(newRow);

    // After POST, a GET is issued to reload the full list with relations
    const updatedList = [newRow, mockRow];
    http.expectOne({ method: 'GET', url: API }).flush(updatedList);

    expect(component.rowData()).toEqual(updatedList);
    expect(component.showNewDialog()).toBe(false);
    expect(component.isCreating()).toBe(false);
  });

  it('shows delete confirmation on requestDelete()', () => {
    fixture.detectChanges();
    http.expectOne(API).flush([mockRow]);

    component.requestDelete('schema-1');
    expect(component.deleteTargetId()).toBe('schema-1');
  });

  it('removes row after confirmDelete()', () => {
    fixture.detectChanges();
    http.expectOne(API).flush([mockRow]);

    component.requestDelete('schema-1');
    component.confirmDelete();
    http.expectOne({ method: 'DELETE', url: `${API}/schema-1` }).flush(null);

    expect(component.rowData()).toEqual([]);
    expect(component.deleteTargetId()).toBeNull();
  });

  it('cancels dialog and resets state', () => {
    fixture.detectChanges();
    http.expectOne(API).flush([]);

    component.openNewDialog();
    component.newTitle.set('Draft');
    component.cancelDialog();

    expect(component.showNewDialog()).toBe(false);
    expect(component.newTitle()).toBe('');
    expect(component.newType()).toBe('form');
  });

  it('isSuperuser returns true for superuser JWT', () => {
    localStorage.setItem('accessToken', makeSuperuserToken());
    fixture.detectChanges();
    http.expectOne(API).flush([]);

    expect(component.isSuperuser()).toBe(true);
    localStorage.removeItem('accessToken');
  });
});

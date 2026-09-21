import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UserList, UserRow } from './user-list';

const USERS: UserRow[] = [
  {
    id: 'u1',
    email: 'a@b.com',
    role: 'user',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'u2',
    email: 'c@d.com',
    role: 'admin',
    createdAt: '2024-01-02T00:00:00Z',
  },
];

describe('UserList', () => {
  let component: UserList;
  let httpController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    httpController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpController.verify());

  it('loads users on init', () => {
    const req = httpController.expectOne('http://localhost:3000/api/v1/users');
    req.flush(USERS);
    expect(component.rowData()).toEqual(USERS);
  });

  it('PATCH on role change — success updates row via applyTransaction', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    const mockGridApi = { applyTransaction: vi.fn() };
    (component as unknown as { gridApi: typeof mockGridApi }).gridApi =
      mockGridApi;

    const updated: UserRow = { ...USERS[0], role: 'admin' };
    const event = {
      colDef: { field: 'role' },
      data: { ...USERS[0] },
      oldValue: 'user',
      newValue: 'admin',
    };
    component.onCellValueChanged(event as never);

    const req = httpController.expectOne(
      'http://localhost:3000/api/v1/users/u1/role',
    );
    expect(req.request.body).toEqual({ role: 'admin' });
    req.flush(updated);

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({
      update: [updated],
    });
    expect(component.isPatching()).toBe(false);
  });

  it('PATCH error reverts role and clears spinner', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    const mockGridApi = { applyTransaction: vi.fn() };
    (component as unknown as { gridApi: typeof mockGridApi }).gridApi =
      mockGridApi;

    const event = {
      colDef: { field: 'role' },
      data: { ...USERS[0] },
      oldValue: 'user',
      newValue: 'admin',
    };
    component.onCellValueChanged(event as never);

    const req = httpController.expectOne(
      'http://localhost:3000/api/v1/users/u1/role',
    );
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({
      update: [{ ...USERS[0], role: 'user' }],
    });
    expect(component.isPatching()).toBe(false);
  });

  it('ignores unrelated column changes without making HTTP request', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    const event = {
      colDef: { field: 'createdAt' },
      data: USERS[0],
      oldValue: USERS[0].createdAt,
      newValue: '2099-01-01T00:00:00Z',
    };
    component.onCellValueChanged(event as never);

    httpController.expectNone('http://localhost:3000/api/v1/users/u1');
  });

  it('PATCH on email change — success updates row via applyTransaction', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    const mockGridApi = { applyTransaction: vi.fn() };
    (component as unknown as { gridApi: typeof mockGridApi }).gridApi =
      mockGridApi;

    const updated: UserRow = { ...USERS[0], email: 'new@b.com' };
    const event = {
      colDef: { field: 'email' },
      data: { ...USERS[0] },
      oldValue: 'a@b.com',
      newValue: 'new@b.com',
    };
    component.onCellValueChanged(event as never);

    const req = httpController.expectOne(
      'http://localhost:3000/api/v1/users/u1',
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ email: 'new@b.com' });
    req.flush(updated);

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({
      update: [updated],
    });
    expect(component.isPatching()).toBe(false);
  });

  it('PATCH on email change — error reverts email and clears spinner', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    const mockGridApi = { applyTransaction: vi.fn() };
    (component as unknown as { gridApi: typeof mockGridApi }).gridApi =
      mockGridApi;

    const event = {
      colDef: { field: 'email' },
      data: { ...USERS[0] },
      oldValue: 'a@b.com',
      newValue: 'new@b.com',
    };
    component.onCellValueChanged(event as never);

    const req = httpController.expectOne(
      'http://localhost:3000/api/v1/users/u1',
    );
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({
      update: [{ ...USERS[0], email: 'a@b.com' }],
    });
    expect(component.isPatching()).toBe(false);
  });

  it('createUser — success adds the returned row to the grid and resets the form', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    const mockGridApi = { applyTransaction: vi.fn() };
    (component as unknown as { gridApi: typeof mockGridApi }).gridApi =
      mockGridApi;

    component.createForm.setValue({
      email: 'new@b.com',
      password: 'Password1!',
      role: 'user',
    });
    component.createUser();

    const req = httpController.expectOne('http://localhost:3000/api/v1/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'new@b.com',
      password: 'Password1!',
      role: 'user',
    });

    const created: UserRow = {
      id: 'u3',
      email: 'new@b.com',
      role: 'user',
      createdAt: '2024-01-03T00:00:00Z',
    };
    req.flush(created);

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({
      add: [created],
    });
    expect(component.createForm.value.email).toBeFalsy();
    expect(component.isCreating()).toBe(false);
  });

  it('createUser — error surfaces createError and clears spinner', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    component.createForm.setValue({
      email: 'dup@b.com',
      password: 'Password1!',
      role: 'user',
    });
    component.createUser();

    const req = httpController.expectOne('http://localhost:3000/api/v1/users');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });

    expect(component.createError()).toBeTruthy();
    expect(component.isCreating()).toBe(false);
  });

  it('createUser — does nothing when the form is invalid', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    component.createForm.setValue({
      email: 'not-an-email',
      password: 'short',
      role: 'user',
    });
    component.createUser();

    httpController.expectNone('http://localhost:3000/api/v1/users');
  });

  it('deleteUser — success removes the row from the grid', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    const mockGridApi = { applyTransaction: vi.fn() };
    (component as unknown as { gridApi: typeof mockGridApi }).gridApi =
      mockGridApi;

    component.deleteUser(USERS[1]);

    const req = httpController.expectOne(
      'http://localhost:3000/api/v1/users/u2',
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({
      remove: [USERS[1]],
    });
  });
});

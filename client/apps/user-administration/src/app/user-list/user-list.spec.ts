import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserList, UserRow } from './user-list';

const USERS: UserRow[] = [
  { id: 'u1', email: 'a@b.com', role: 'user', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'u2', email: 'c@d.com', role: 'admin', createdAt: '2024-01-02T00:00:00Z' },
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
    (component as unknown as { gridApi: typeof mockGridApi }).gridApi = mockGridApi;

    const updated: UserRow = { ...USERS[0], role: 'admin' };
    const event = {
      colDef: { field: 'role' },
      data: { ...USERS[0] },
      oldValue: 'user',
      newValue: 'admin',
    };
    component.onCellValueChanged(event as never);

    const req = httpController.expectOne('http://localhost:3000/api/v1/users/u1/role');
    expect(req.request.body).toEqual({ role: 'admin' });
    req.flush(updated);

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ update: [updated] });
    expect(component.isPatching()).toBe(false);
  });

  it('PATCH error reverts role and clears spinner', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    const mockGridApi = { applyTransaction: vi.fn() };
    (component as unknown as { gridApi: typeof mockGridApi }).gridApi = mockGridApi;

    const event = {
      colDef: { field: 'role' },
      data: { ...USERS[0] },
      oldValue: 'user',
      newValue: 'admin',
    };
    component.onCellValueChanged(event as never);

    const req = httpController.expectOne('http://localhost:3000/api/v1/users/u1/role');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(mockGridApi.applyTransaction).toHaveBeenCalledWith({ update: [{ ...USERS[0], role: 'user' }] });
    expect(component.isPatching()).toBe(false);
  });

  it('ignores non-role column changes without making HTTP request', () => {
    httpController.expectOne('http://localhost:3000/api/v1/users').flush(USERS);

    const event = {
      colDef: { field: 'email' },
      data: USERS[0],
      oldValue: 'a@b.com',
      newValue: 'new@b.com',
    };
    component.onCellValueChanged(event as never);

    httpController.expectNone('http://localhost:3000/api/v1/users/u1/role');
  });
});

import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  CellClickedEvent,
  CellValueChangedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
} from '@ag-grid-community/core';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BaseHttpService } from '@custom-forms/http';
import { Button, Input, Select } from '@custom-forms/ui';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export interface UserRow {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'superuser', label: 'Superuser' },
];

@Component({
  selector: 'cf-user-list',
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, ReactiveFormsModule, Button, Input, Select],
})
export class UserList implements OnInit {
  private readonly http = inject(BaseHttpService);
  private readonly fb = inject(FormBuilder);

  rowData = signal<UserRow[]>([]);
  isPatching = signal(false);
  isCreating = signal(false);
  createError = signal<string | null>(null);

  readonly roleOptions = ROLE_OPTIONS;

  readonly createForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['user', [Validators.required]],
  });

  private gridApi!: GridApi<UserRow>;

  columnDefs: ColDef<UserRow>[] = [
    { field: 'email', flex: 2, editable: true },
    {
      field: 'role',
      flex: 1,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['user', 'admin', 'superuser'] },
    },
    { field: 'createdAt', flex: 1 },
    {
      colId: 'actions',
      headerName: '',
      flex: 0.6,
      sortable: false,
      filter: false,
      cellRenderer: () =>
        '<button type="button" class="user-list__delete-btn">Delete</button>',
    },
  ];

  defaultColDef: ColDef = { sortable: true, filter: true };

  getRowId = (params: { data: UserRow }) => params.data.id;

  ngOnInit(): void {
    this.http
      .get<UserRow[]>('/users')
      .subscribe((users) => this.rowData.set(users));
  }

  onGridReady(params: GridReadyEvent<UserRow>): void {
    this.gridApi = params.api;
  }

  onCellValueChanged(e: CellValueChangedEvent<UserRow>): void {
    const field = e.colDef.field;
    if (field !== 'role' && field !== 'email') return;

    const prevValue = e.oldValue as string;
    const newValue = e.newValue as string;
    const url =
      field === 'role' ? `/users/${e.data.id}/role` : `/users/${e.data.id}`;
    const body = field === 'role' ? { role: newValue } : { email: newValue };

    this.isPatching.set(true);

    this.http.patch<UserRow>(url, body).subscribe({
      next: (updated) => {
        this.gridApi.applyTransaction({ update: [updated] });
        this.isPatching.set(false);
      },
      error: () => {
        this.gridApi.applyTransaction({
          update: [{ ...e.data, [field]: prevValue }],
        });
        this.isPatching.set(false);
      },
    });
  }

  onCellClicked(e: CellClickedEvent<UserRow>): void {
    if (e.colDef.colId !== 'actions' || !e.data) return;
    if (!confirm(`Delete user ${e.data.email}?`)) return;
    this.deleteUser(e.data);
  }

  deleteUser(row: UserRow): void {
    this.http.delete(`/users/${row.id}`).subscribe(() => {
      this.gridApi.applyTransaction({ remove: [row] });
    });
  }

  createUser(): void {
    if (this.createForm.invalid) return;

    this.isCreating.set(true);
    this.createError.set(null);

    this.http.post<UserRow>('/users', this.createForm.getRawValue()).subscribe({
      next: (created) => {
        this.gridApi.applyTransaction({ add: [created] });
        this.createForm.reset({ email: '', password: '', role: 'user' });
        this.isCreating.set(false);
      },
      error: () => {
        this.createError.set(
          'Could not create user. The email may already be in use.',
        );
        this.isCreating.set(false);
      },
    });
  }
}

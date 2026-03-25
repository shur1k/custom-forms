import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry, CellValueChangedEvent } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export interface UserRow {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

const API = 'http://localhost:3000/api/v1/users';

@Component({
  selector: 'cf-user-list',
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
})
export class UserList implements OnInit {
  private readonly http = inject(HttpClient);

  rowData = signal<UserRow[]>([]);
  isPatching = signal(false);

  private gridApi!: GridApi<UserRow>;

  columnDefs: ColDef<UserRow>[] = [
    { field: 'email', flex: 2 },
    {
      field: 'role',
      flex: 1,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['user', 'admin', 'superuser'] },
    },
    { field: 'createdAt', flex: 1 },
  ];

  defaultColDef: ColDef = { sortable: true, filter: true };

  getRowId = (params: { data: UserRow }) => params.data.id;

  ngOnInit(): void {
    this.http.get<UserRow[]>(API).subscribe((users) => this.rowData.set(users));
  }

  onGridReady(params: GridReadyEvent<UserRow>): void {
    this.gridApi = params.api;
  }

  onCellValueChanged(e: CellValueChangedEvent<UserRow>): void {
    if (e.colDef.field !== 'role') return;

    const prevRole = e.oldValue as string;
    const newRole = e.newValue as string;

    this.isPatching.set(true);

    this.http.patch<UserRow>(`${API}/${e.data.id}/role`, { role: newRole }).subscribe({
      next: (updated) => {
        this.gridApi.applyTransaction({ update: [updated] });
        this.isPatching.set(false);
      },
      error: () => {
        this.gridApi.applyTransaction({ update: [{ ...e.data, role: prevRole }] });
        this.isPatching.set(false);
      },
    });
  }
}

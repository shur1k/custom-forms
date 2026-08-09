import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { BaseHttpService } from '@custom-forms/http';
import { AuthStateService } from '@custom-forms/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  RowClickedEvent,
} from '@ag-grid-community/core';
import { SchemaRow } from '../form-schema.types';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const TYPE_OPTIONS = [
  { value: 'form', label: 'Form' },
  { value: 'page', label: 'Page' },
  { value: 'dashboard', label: 'Dashboard' },
];

@Component({
  selector: 'cf-form-list',
  templateUrl: './form-list.html',
  styleUrl: './form-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
})
export class FormList implements OnInit {
  private readonly http      = inject(BaseHttpService);
  private readonly router    = inject(Router);
  private readonly route     = inject(ActivatedRoute);
  private readonly authState = inject(AuthStateService);

  private gridApi!: GridApi<SchemaRow>;

  readonly rowData        = signal<SchemaRow[]>([]);
  readonly isLoading      = signal(false);
  readonly showNewDialog  = signal(false);
  readonly newTitle       = signal('');
  readonly newType        = signal<'form' | 'page' | 'dashboard'>('form');
  readonly isCreating     = signal(false);
  readonly deleteTargetId = signal<string | null>(null);

  readonly typeOptions = TYPE_OPTIONS;

  readonly columnDefs = computed<ColDef<SchemaRow>[]>(() => [
    { field: 'title', flex: 2 },
    { headerName: 'Type', valueGetter: (p) => p.data?.type?.name, flex: 1 },
    ...(this.authState.isSuperuser()
      ? [{ headerName: 'Owner', valueGetter: (p: { data?: SchemaRow }) => p.data?.owner?.email, flex: 1 } as ColDef<SchemaRow>]
      : []),
    { field: 'createdAt', flex: 1 },
    {
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: () => '<button class="delete-btn">Delete</button>',
    },
  ]);

  readonly defaultColDef: ColDef = { sortable: true, filter: true };

  readonly getRowId = (params: { data: SchemaRow }) => params.data.id;

  ngOnInit(): void {
    this.isLoading.set(true);
    this.http.get<SchemaRow[]>('/schemas').subscribe({
      next: (rows) => { this.rowData.set(rows); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  onGridReady(params: GridReadyEvent<SchemaRow>): void {
    this.gridApi = params.api;
  }

  onRowClicked(event: RowClickedEvent<SchemaRow>): void {
    if ((event.event?.target as HTMLElement)?.closest('.delete-btn')) return;
    this.router.navigate([event.data!.id], { relativeTo: this.route });
  }

  onCellClicked(event: CellClickedEvent<SchemaRow>): void {
    if (
      event.colDef.headerName === 'Actions' &&
      (event.event?.target as HTMLElement)?.classList.contains('delete-btn')
    ) {
      this.requestDelete(event.data!.id);
    }
  }

  openNewDialog(): void {
    this.showNewDialog.set(true);
  }

  cancelDialog(): void {
    this.showNewDialog.set(false);
    this.newTitle.set('');
    this.newType.set('form');
  }

  confirmCreate(): void {
    if (!this.newTitle().trim()) return;
    this.isCreating.set(true);
    this.http.post<SchemaRow>('/schemas', { title: this.newTitle().trim(), type: this.newType() }).subscribe({
      next: (row) => {
        this.rowData.update((rows) => [...rows, row]);
        this.isCreating.set(false);
        this.cancelDialog();
      },
      error: () => this.isCreating.set(false),
    });
  }

  requestDelete(id: string): void {
    this.deleteTargetId.set(id);
  }

  cancelDelete(): void {
    this.deleteTargetId.set(null);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (!id) return;
    this.http.delete(`/schemas/${id}`).subscribe({
      next: () => {
        this.rowData.update((rows) => rows.filter((r) => r.id !== id));
        this.deleteTargetId.set(null);
      },
      error: () => this.deleteTargetId.set(null),
    });
  }
}

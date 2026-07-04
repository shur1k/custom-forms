import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentDef, asCol, asColSpan, asRow, asRowSpan } from '../../form-schema.types';

export const ROW_HEIGHT_PX = 80;
export const COLS = 12;

@Component({
  selector: 'cf-canvas',
  templateUrl: './canvas.html',
  styleUrl: './canvas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList],
})
export class Canvas {
  private readonly destroyRef = inject(DestroyRef);
  private readonly abortCtrl  = new AbortController();

  readonly components       = input<ComponentDef[]>([]);
  readonly selectedId       = input<string | null>(null);

  readonly componentDropped  = output<ComponentDef>();
  readonly componentMoved    = output<{ id: string; col: number; row: number }>();
  readonly componentResized  = output<{ id: string; w: number; h: number }>();
  readonly componentRemoved  = output<string>();
  readonly componentSelected = output<string>();

  readonly canvasRef = viewChild<ElementRef<HTMLDivElement>>('canvasEl');

  constructor() {
    this.destroyRef.onDestroy(() => this.abortCtrl.abort());
  }

  itemStyle(comp: ComponentDef): Record<string, string> {
    return {
      left:   `${(comp.col / COLS) * 100}%`,
      width:  `${(comp.w  / COLS) * 100}%`,
      top:    `${comp.row * ROW_HEIGHT_PX}px`,
      height: `${comp.h   * ROW_HEIGHT_PX}px`,
    };
  }

  /** Receives drops from the palette only (same-container drops are ignored). */
  onDrop(event: CdkDragDrop<ComponentDef[]>): void {
    if (event.previousContainer === event.container) return;

    const canvasEl = this.canvasRef()!.nativeElement;
    const rect = canvasEl.getBoundingClientRect();
    const relX = Math.max(0, Math.min(event.dropPoint.x - rect.left, rect.width - 1));
    const relY = Math.max(0, event.dropPoint.y - rect.top);

    const col = asCol(Math.min(COLS - 1, Math.floor((relX / rect.width) * COLS)));
    const row = asRow(Math.floor(relY / ROW_HEIGHT_PX));
    const draggedItem = event.item.data as { type: ComponentDef['type'] };

    const newComp: ComponentDef = {
      id:   crypto.randomUUID(),
      type: draggedItem.type,
      col, row,
      w: asColSpan(3),
      h: asRowSpan(1),
      props: { label: draggedItem.type, showTitle: true, disabled: false, textColor: '#000000' },
    };
    this.componentDropped.emit(newComp);
  }

  /**
   * Native pointer-based drag for canvas items.
   * During drag: directly moves the element via transform (no Angular CD overhead).
   * On release: snaps to grid and emits final position.
   */
  onItemMouseDown(event: MouseEvent, comp: ComponentDef): void {
    if ((event.target as HTMLElement).closest('.canvas__remove, .canvas__resize-handle')) return;
    event.preventDefault();

    const el = (event.currentTarget as HTMLElement);
    const startX = event.clientX;
    const startY = event.clientY;

    el.style.zIndex = '10';
    el.style.cursor = 'grabbing';
    el.classList.add('canvas__item--dragging');

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const onUp = (e: MouseEvent) => {
      el.style.transform = '';
      el.style.zIndex = '';
      el.style.cursor = '';
      el.classList.remove('canvas__item--dragging');

      const canvasWidth = this.canvasRef()!.nativeElement.getBoundingClientRect().width;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const maxCol = COLS - comp.w;
      const newCol = Math.max(0, Math.min(maxCol, Math.round(comp.col + (dx / canvasWidth) * COLS)));
      const newRow = Math.max(0, Math.round(comp.row + dy / ROW_HEIGHT_PX));

      this.componentMoved.emit({ id: comp.id, col: newCol, row: newRow });

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove, { signal: this.abortCtrl.signal });
    document.addEventListener('mouseup',   onUp,   { signal: this.abortCtrl.signal });
  }

  onResizeStart(event: MouseEvent, comp: ComponentDef): void {
    event.stopPropagation();
    event.preventDefault();

    const el       = (event.currentTarget as HTMLElement).closest<HTMLElement>('.canvas__item')!;
    const startX   = event.clientX;
    const startY   = event.clientY;
    const startW   = el.offsetWidth;
    const startH   = el.offsetHeight;

    const onMove = (e: MouseEvent) => {
      el.style.width  = `${Math.max(20, startW + (e.clientX - startX))}px`;
      el.style.height = `${Math.max(20, startH + (e.clientY - startY))}px`;
    };

    const onUp = (e: MouseEvent) => {
      el.style.width  = '';
      el.style.height = '';

      const canvasWidth = this.canvasRef()!.nativeElement.getBoundingClientRect().width;
      const newW = Math.max(1, Math.min(COLS, Math.round(comp.w + ((e.clientX - startX) / canvasWidth) * COLS)));
      const newH = Math.max(1, Math.round(comp.h + (e.clientY - startY) / ROW_HEIGHT_PX));
      this.componentResized.emit({ id: comp.id, w: newW, h: newH });

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };

    document.addEventListener('mousemove', onMove, { signal: this.abortCtrl.signal });
    document.addEventListener('mouseup',   onUp,   { signal: this.abortCtrl.signal });
  }
}

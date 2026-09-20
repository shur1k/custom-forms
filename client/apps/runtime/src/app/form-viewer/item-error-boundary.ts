import {
  ChangeDetectorRef,
  Component,
  DoCheck,
  ErrorHandler,
  inject,
  signal,
} from '@angular/core';

/**
 * AC-16 defines a rendering failure as a component that "raises an uncaught
 * error or cannot resolve its bound data." resolveField/resolveAction in
 * form-viewer.ts already catch the second case; this catches the first —
 * an uncaught throw during a projected component's own change detection —
 * by detaching this boundary from the parent's CD cycle and driving it
 * manually inside a try/catch, so a throw stays local to this item instead
 * of propagating up and blanking the whole view.
 */
@Component({
  selector: 'cf-item-error-boundary',
  template: `
    @if (hasError()) {
      <p class="form-viewer__error-placeholder">
        ⚠ Failed to render this component.
      </p>
    } @else {
      <ng-content />
    }
  `,
})
export class ItemErrorBoundary implements DoCheck {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly errorHandler = inject(ErrorHandler);

  readonly hasError = signal(false);

  constructor() {
    this.cdr.detach();
  }

  ngDoCheck(): void {
    if (this.hasError()) return;
    try {
      this.cdr.detectChanges();
    } catch (err) {
      this.hasError.set(true);
      this.errorHandler.handleError(err);
      this.cdr.detectChanges();
    }
  }
}

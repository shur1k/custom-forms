import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemErrorBoundary } from './item-error-boundary';

@Component({
  selector: 'cf-throwing-child',
  template: `{{ mustThrow() }}`,
})
class ThrowingChild {
  mustThrow(): string {
    throw new Error('render-time boom');
  }
}

@Component({
  selector: 'cf-safe-child',
  template: `safe content`,
})
class SafeChild {}

@Component({
  imports: [ItemErrorBoundary, ThrowingChild],
  template: `
    <cf-item-error-boundary>
      <cf-throwing-child />
    </cf-item-error-boundary>
  `,
})
class ThrowingHost {}

@Component({
  imports: [ItemErrorBoundary, SafeChild],
  template: `
    <cf-item-error-boundary>
      <cf-safe-child />
    </cf-item-error-boundary>
  `,
})
class SafeHost {}

describe('ItemErrorBoundary', () => {
  it('shows a fallback placeholder instead of letting a render-time throw blank the view (AC-16)', () => {
    const fixture: ComponentFixture<ThrowingHost> =
      TestBed.createComponent(ThrowingHost);

    expect(() => fixture.detectChanges()).not.toThrow();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Failed to render this component');
    expect(el.querySelector('cf-throwing-child')).toBeNull();
  });

  it('renders projected content normally when nothing throws', () => {
    const fixture: ComponentFixture<SafeHost> =
      TestBed.createComponent(SafeHost);

    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('safe content');
    expect(el.textContent).not.toContain('Failed to render this component');
  });
});

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CdkDrag, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { ComponentType } from '../../form-schema.types';

interface PaletteItem {
  type: ComponentType;
  label: string;
  icon: SafeHtml;
}

const INPUT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="2" y="7" width="20" height="10" rx="2"/>
  <line x1="6" y1="12" x2="6" y2="12" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const SELECT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="2" y="7" width="20" height="10" rx="2"/>
  <polyline points="15,10 18,12 15,14"/>
</svg>`;

const BUTTON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="2" y="8" width="20" height="8" rx="4" fill="currentColor" opacity="0.15"/>
  <rect x="2" y="8" width="20" height="8" rx="4"/>
</svg>`;

@Component({
  selector: 'cf-component-palette',
  templateUrl: './component-palette.html',
  styleUrl: './component-palette.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, CdkDragPlaceholder, CdkDropList],
})
export class ComponentPalette {
  private readonly sanitizer = inject(DomSanitizer);

  readonly paletteItems: PaletteItem[] = [
    { type: 'input',  label: 'Input',  icon: this.sanitizer.bypassSecurityTrustHtml(INPUT_ICON) },
    { type: 'select', label: 'Select', icon: this.sanitizer.bypassSecurityTrustHtml(SELECT_ICON) },
    { type: 'button', label: 'Button', icon: this.sanitizer.bypassSecurityTrustHtml(BUTTON_ICON) },
  ];

  readonly noReturn = () => false;
}

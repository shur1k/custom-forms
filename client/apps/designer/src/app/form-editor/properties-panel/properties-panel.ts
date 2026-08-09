import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ComponentDef, ComponentProps } from '../../form-schema.types';

interface ColorOption {
  value: string;
  label: string;
}

@Component({
  selector: 'cf-properties-panel',
  templateUrl: './properties-panel.html',
  styleUrl: './properties-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe],
})
export class PropertiesPanel {
  readonly component   = input<ComponentDef | null>(null);
  readonly propsChanged = output<ComponentDef>();

  readonly colorOptions: ColorOption[] = [
    { value: '#000000', label: 'Black' },
    { value: '#ef4444', label: 'Red' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#22c55e', label: 'Green' },
    { value: '#f59e0b', label: 'Amber' },
  ];

  updateProp<K extends keyof ComponentProps>(key: K, value: ComponentProps[K]): void {
    const comp = this.component();
    if (!comp) return;
    this.propsChanged.emit({ ...comp, props: { ...comp.props, [key]: value } });
  }

  updateLayout(key: 'w' | 'h' | 'col' | 'row', value: number): void {
    const comp = this.component();
    if (!comp) return;
    this.propsChanged.emit({ ...comp, [key]: value } as ComponentDef);
  }
}

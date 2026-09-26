import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import {
  ButtonAction,
  ComponentDef,
  ComponentProps,
  SelectChoice,
} from '../../form-schema.types';

interface ColorOption {
  value: string;
  label: string;
}

interface ActionOption {
  value: ButtonAction;
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
  readonly component = input<ComponentDef | null>(null);
  readonly propsChanged = output<ComponentDef>();

  readonly colorOptions: ColorOption[] = [
    { value: '#000000', label: 'Black' },
    { value: '#ef4444', label: 'Red' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#22c55e', label: 'Green' },
    { value: '#f59e0b', label: 'Amber' },
  ];

  readonly actionOptions: ActionOption[] = [
    { value: 'save', label: 'Save' },
    { value: 'back-to-list', label: 'Back to Forms List' },
  ];

  updateProp<K extends keyof ComponentProps>(
    key: K,
    value: ComponentProps[K],
  ): void {
    const comp = this.component();
    if (!comp) return;
    this.propsChanged.emit({ ...comp, props: { ...comp.props, [key]: value } });
  }

  updateLayout(key: 'w' | 'h' | 'col' | 'row', value: number): void {
    const comp = this.component();
    if (!comp) return;
    this.propsChanged.emit({ ...comp, [key]: value } as ComponentDef);
  }

  addChoice(): void {
    const comp = this.component();
    if (!comp) return;
    const choices: SelectChoice[] = [
      ...comp.props.choices,
      { value: '', label: '' },
    ];
    this.propsChanged.emit({ ...comp, props: { ...comp.props, choices } });
  }

  removeChoice(index: number): void {
    const comp = this.component();
    if (!comp) return;
    const choices = comp.props.choices.filter((_, i) => i !== index);
    this.propsChanged.emit({ ...comp, props: { ...comp.props, choices } });
  }

  updateChoice(index: number, key: keyof SelectChoice, value: string): void {
    const comp = this.component();
    if (!comp) return;
    const choices = comp.props.choices.map((choice, i) =>
      i === index ? { ...choice, [key]: value } : choice,
    );
    this.propsChanged.emit({ ...comp, props: { ...comp.props, choices } });
  }
}

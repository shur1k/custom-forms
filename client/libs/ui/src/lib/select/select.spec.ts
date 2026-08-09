import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Select } from './select';

describe('Select', () => {
  let component: Select;
  let fixture: ComponentFixture<Select>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Select],
    }).compileComponents();

    fixture = TestBed.createComponent(Select);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a select element', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select')).not.toBeNull();
  });

  it('shows label text when label input is provided', () => {
    fixture.componentRef.setInput('label', 'Role');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.select__label-text') as HTMLElement;
    expect(span.textContent?.trim()).toBe('Role');
  });

  it('hides label span when label is empty', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.select__label-text')).toBeNull();
  });

  it('renders options from the options input', () => {
    fixture.componentRef.setInput('options', [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ]);
    fixture.detectChanges();
    const opts = fixture.nativeElement.querySelectorAll('option[value="a"], option[value="b"]');
    expect(opts.length).toBe(2);
  });

  describe('ControlValueAccessor', () => {
    it('writeValue updates the value property', () => {
      component.writeValue('foo');
      expect(component.value).toBe('foo');
    });

    it('writeValue treats null/undefined as empty string', () => {
      component.writeValue(null as unknown as string);
      expect(component.value).toBe('');
    });

    it('calls onChange when option is selected', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);
      fixture.componentRef.setInput('options', [{ value: 'x', label: 'X' }]);
      fixture.detectChanges();

      const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
      select.value = 'x';
      select.dispatchEvent(new Event('change'));

      expect(onChange).toHaveBeenCalledWith('x');
    });

    it('calls onTouched on blur', () => {
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('select').dispatchEvent(new Event('blur'));
      expect(onTouched).toHaveBeenCalled();
    });

    it('disables the select when setDisabledState(true)', () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
      expect(select.disabled).toBe(true);
    });
  });
});

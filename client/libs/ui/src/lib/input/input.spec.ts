import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Input } from './input';

describe('Input', () => {
  let component: Input;
  let fixture: ComponentFixture<Input>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Input],
    }).compileComponents();

    fixture = TestBed.createComponent(Input);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders an input element with default type "text"', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('text');
  });

  it('passes the type input to the native input', () => {
    fixture.componentRef.setInput('type', 'email');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('email');
  });

  it('shows label text when label input is provided', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.input__label-text') as HTMLElement;
    expect(span.textContent?.trim()).toBe('Email');
  });

  it('hides label span when label is empty', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.input__label-text');
    expect(span).toBeNull();
  });

  it('shows error message when error input is provided', () => {
    fixture.componentRef.setInput('error', 'Email is required.');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.input__error') as HTMLElement;
    expect(span).not.toBeNull();
    expect(span.textContent?.trim()).toBe('Email is required.');
  });

  it('hides error element when error is null', () => {
    fixture.componentRef.setInput('error', null);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.input__error');
    expect(span).toBeNull();
  });

  it('adds error modifier class to input when error is set', () => {
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.classList.contains('input__field--error')).toBe(true);
  });

  describe('ControlValueAccessor', () => {
    it('writeValue updates the value property', () => {
      component.writeValue('hello');
      expect(component.value).toBe('hello');
    });

    it('writeValue treats null/undefined as empty string', () => {
      component.writeValue(null as unknown as string);
      expect(component.value).toBe('');
    });

    it('calls onChange when user types', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = 'typed';
      input.dispatchEvent(new Event('input'));

      expect(onChange).toHaveBeenCalledWith('typed');
    });

    it('calls onTouched when the input loses focus', () => {
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('input').dispatchEvent(new Event('blur'));
      expect(onTouched).toHaveBeenCalled();
    });

    it('disables the input when setDisabledState(true)', () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('re-enables the input when setDisabledState(false)', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(false);
    });
  });
});

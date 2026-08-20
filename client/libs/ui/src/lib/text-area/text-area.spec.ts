import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextArea } from './text-area';

describe('TextArea', () => {
  let component: TextArea;
  let fixture: ComponentFixture<TextArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextArea],
    }).compileComponents();

    fixture = TestBed.createComponent(TextArea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a textarea element with default rows 3', () => {
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;
    expect(textarea.rows).toBe(3);
  });

  it('passes the rows input to the native textarea', () => {
    fixture.componentRef.setInput('rows', 6);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;
    expect(textarea.rows).toBe(6);
  });

  it('shows label text when label input is provided', () => {
    fixture.componentRef.setInput('label', 'Description');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector(
      '.text-area__label-text',
    ) as HTMLElement;
    expect(span.textContent?.trim()).toBe('Description');
  });

  it('hides label span when label is empty', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.text-area__label-text');
    expect(span).toBeNull();
  });

  it('shows error message when error input is provided', () => {
    fixture.componentRef.setInput('error', 'Description is required.');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector(
      '.text-area__error',
    ) as HTMLElement;
    expect(span).not.toBeNull();
    expect(span.textContent?.trim()).toBe('Description is required.');
  });

  it('hides error element when error is null', () => {
    fixture.componentRef.setInput('error', null);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.text-area__error');
    expect(span).toBeNull();
  });

  it('adds error modifier class to textarea when error is set', () => {
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;
    expect(textarea.classList.contains('text-area__field--error')).toBe(true);
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

      const textarea = fixture.nativeElement.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;
      textarea.value = 'typed';
      textarea.dispatchEvent(new Event('input'));

      expect(onChange).toHaveBeenCalledWith('typed');
    });

    it('calls onTouched when the textarea loses focus', () => {
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);
      fixture.detectChanges();

      fixture.nativeElement
        .querySelector('textarea')
        .dispatchEvent(new Event('blur'));
      expect(onTouched).toHaveBeenCalled();
    });

    it('disables the textarea when setDisabledState(true)', () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(true);
    });

    it('re-enables the textarea when setDisabledState(false)', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(false);
    });
  });
});

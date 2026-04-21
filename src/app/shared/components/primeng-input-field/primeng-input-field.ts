import { Component, EventEmitter, Input, Optional, Output, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { SharedLibsModule } from '../../shared-libs.module';

@Component({
  selector: 'primeng-input-field, prime-ng-input-field',
  standalone: true,
  imports: [SharedLibsModule],
  templateUrl: './primeng-input-field.html',
  styleUrls: ['./primeng-input-field.scss'],
})
export class PrimeNgInputField {
  @Input() type: string = 'text';
  @Input() rows: number = 6;
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() id: string = '';
  @Input() helpText: string = '';
  @Input() errorMessage: string = '';
  @Input() isSubmitted: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  value: string = '';
  isDisabled: boolean = false;
  isPasswordVisible: boolean = false;

  get isTextArea(): boolean {
    return this.type === 'textarea';
  }

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value: string): void {
    this.value = value ?? '';
    this.onChange(this.value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValueFromEvent(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) {
      return;
    }
    this.value = input.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  get inputType(): string {
    if (this.type !== 'password') {
      return this.type;
    }
    return this.isPasswordVisible ? 'text' : 'password';
  }

  get control() {
    return this.ngControl?.control;
  }

  get invalid(): boolean {
    return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty || this.isSubmitted);
  }

  get autoErrorMessage(): string | null {
    if (!this.control?.errors) {
      return null;
    }
    const errors = this.control.errors;
    if (errors['required']) {
      return `${this.label || 'This field'} is required`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address.';
    }
    if (errors['minlength']) {
      return `Minimum length is ${errors['minlength'].requiredLength} characters.`;
    }
    if (errors['maxlength']) {
      return `Maximum length is ${errors['maxlength'].requiredLength} characters.`;
    }
    return null;
  }

  get finalErrorMessage(): string | null {
    if (this.errorMessage) {
      return this.errorMessage;
    }
    if (this.invalid) {
      return this.autoErrorMessage;
    }
    return null;
  }

   onChange: (value: string) => void = () => {};
   onTouched: () => void = () => {};
}

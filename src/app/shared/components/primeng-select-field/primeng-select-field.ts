import { Component, EventEmitter, Input, Optional, Output, Self, Signal, isSignal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { SharedLibsModule } from '../../shared-libs.module';
import { Option } from '../../selectOptionService';

@Component({
  selector: 'primeng-select-field, prime-ng-select-field',
  standalone: true,
  imports: [SharedLibsModule],
  templateUrl: './primeng-select-field.html',
  styleUrls: ['./primeng-select-field.scss'],
})
export class PrimeNgSelectField {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select option';
  @Input() id: string = '';
  @Input() helpText: string = '';
  @Input() errorMessage: string = '';
  @Input() isSubmitted: boolean = false;
  @Input() prefixIcon: string = '';
  @Input() options: Option[] | Signal<Option[]> = [];
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() showClear: boolean = false;
  @Input() loading: boolean = false;
  @Output() valueChange = new EventEmitter<any>();

  value: any = null;
  isDisabled: boolean = false;

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value: any): void {
    this.value = value;
    this.onChange(this.value);
  }

  get optionList(): Option[] {
    return isSignal(this.options) ? this.options() : this.options;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  private normalizeValue(value: any): any {
    if (value == null) {
      return value;
    }

    if (this.optionValue && typeof value === 'object' && value[this.optionValue] !== undefined) {
      return value[this.optionValue];
    }

    return value;
  }

  handleChange(value: any): void {
    this.value = this.normalizeValue(value);
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  get invalid(): boolean {
    return !!this.ngControl?.control && this.ngControl.control.invalid && (this.ngControl.control.touched || this.ngControl.control.dirty || this.isSubmitted);
  }

  get autoErrorMessage(): string | null {
    const errors = this.ngControl?.control?.errors;
    if (!errors) {
      return null;
    }
    if (errors['required']) {
      return `${this.label || 'This field'} is required`;
    }
    return null;
  }

  get finalErrorMessage(): string | null {
    return this.errorMessage || (this.invalid ? this.autoErrorMessage : null);
  }

   onChange: (value: any) => void = () => {};
   onTouched: () => void = () => {};
}

import { Component, EventEmitter, input, Input, Optional, Output, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { SharedLibsModule } from '../../shared-libs.module';

@Component({
  selector: 'app-input-field',
  imports: [SharedLibsModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss',
})
export class InputField {
  @Input() type:string = 'text'
  @Input() value:string = ''
  @Input() label:string = ''
  @Input() placeholder:string = ''
  @Input() id:string = ''
  @Input() errorMessage:string = '' //optional error message for validation
  @Input() isSubmitted:boolean = false
  @Input() validationMessages:{message:string, valid:boolean}[] = []

  @Output() typeEvent:EventEmitter<string> = new EventEmitter<string>()

  isDisabled:boolean = false
  isPasswordVisible:boolean = false


 constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this; // ✅ Connect control to custom accessor
    }
  }

  onChange:(value:string) => void = () => {}
  onTouched:() => void = () => {}
  
  writeValue(value:string):void{
    this.value = value
    this.onChange(value)
  }

  registerOnChange(fn:(value:string)=>void):void{
    this.onChange = fn
  }

  registerOnTouched(fn:()=>void):void{
    this.onTouched = fn
  }

  writeValueFromEvent(event:Event){
    const inputElement = event.target as HTMLInputElement
    if(inputElement){
      this.writeValue(inputElement.value)
      this.typeEvent.emit(inputElement.value)
    }
  }

  setDisabledState(state:boolean):void{
    this.isDisabled = state
  }

  togglePasswordVisibility(){
    this.isPasswordVisible = !this.isPasswordVisible
  }

  // getters for control state

  get control(){
    return this.ngControl?.control
  }

  get invalid(){
    const angularInvalid = !!this.control && this.control.invalid && (this.control.touched || this.control.dirty)
    return  angularInvalid || !!this.errorMessage

  }

  get valid(){
    return !!this.control && this.control.valid
  }

  get errors(){
    return this.control?.errors ?? null
  }

  get autoErrorMessage():string | null {
    if(!this.errors) return null
    
    if(this.errors['required']) return this.label+ ' is required'
    if (this.errors['email'])   return 'Please enter a valid email address'
    if(this.errors['minlength'])
      return `Minimum length is ${this.errors['minlength'].requiredLength} chracters. `
    if (this.errors['maxlength'])
      return `Maximum length is ${this.errors['maxlength'].requiredLength} characters.`;
     if (this.errors['hasUpperCase']) return 'At least one uppercase letter required';
    if (this.errors['hasLowerCase']) return 'At least one lowercase letter required';
    if (this.errors['hasNumber']) return 'At least one number required';
    if(this.errors['passwordMismatch']) return this.label+' is not matched.'

    return null
  }

  get finalErrorMessage(): string | null {
  // Show error if control is touched or dirty, or if there is a custom error
  if (this.control && (this.control.touched || this.control.dirty || this.isSubmitted)) {
    return this.autoErrorMessage ?? this.errorMessage;
  }
  return null;
}
}

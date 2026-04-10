import { Component, inject } from '@angular/core';
import { Shared } from '../../../shared/shared.module';
import { FormGroup } from '@angular/forms';
import { regStep3Form } from '../../../shared/forms.config';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reg-step-3',
  imports: [Shared],
  templateUrl: './reg-step-3.html',
  styleUrl: './reg-step-3.scss',
})
export class RegStep3 {
  regStep3Form:FormGroup = regStep3Form
  isSubmitted:boolean = false
  validationMessages:{message:string, valid:boolean}[]=[]
  authService = inject(AuthService)
  isLoading = this.authService.isLoading
  router:Router = inject(Router)
  
  ngOnInit(){
    // listen for value changes on password field
    const confirmPassword = this.regStep3Form.get('confirm_password')

    this.regStep3Form.get('password')?.valueChanges.subscribe((value:string)=>{
      this.generateValidationMessages(value)
      confirmPassword?.updateValueAndValidity()
    })
  }

  generateValidationMessages(value:string = ''){
 this.validationMessages = [
      { message: 'A minimum of 8 characters', valid: value.length >= 8 },
      { message: 'At least one uppercase letter', valid: /[A-Z]/.test(value) },
      { message: 'At least one lowercase letter', valid: /[a-z]/.test(value) },
      { message: 'At least one number', valid: /[0-9]/.test(value) },
    ];
  }

  submitForm(){
this.isSubmitted = true
this.regStep3Form.markAllAsTouched()
if(!this.regStep3Form.valid || !this.validationMessages.every((message)=>message.valid)) return

this.authService.regStep2(this.regStep3Form.value).subscribe({
  next:(res)=>{
    this.router.navigate(['/reg-step-4'])
    console.log(res)
  },
  error:(err)=>{
    console.log(err)
  }
})

console.log(this.regStep3Form.value)

  }

}

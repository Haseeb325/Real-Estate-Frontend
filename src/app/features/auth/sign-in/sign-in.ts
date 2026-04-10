import { Component, inject } from '@angular/core';
import { Shared } from '../../../shared/shared.module';
import { InputField } from '../../../shared/components/input-field/input-field';
import { logingForm } from '../../../shared/forms.config';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-sign-in',
  imports: [Shared, InputField],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
loginForm:FormGroup = logingForm
isSubmitted:boolean = false
authService = inject(AuthService)

submitForm(){
  this.isSubmitted = true
  this.loginForm.markAllAsTouched()
  if(!this.loginForm.valid) return
  this.authService.signIn(this.loginForm.value).subscribe({
    next:(res)=>{
      console.log(res)
    },
    error:(err)=>{
      console.log(err)
    }
  })
  console.log(this.loginForm.value)
}


}

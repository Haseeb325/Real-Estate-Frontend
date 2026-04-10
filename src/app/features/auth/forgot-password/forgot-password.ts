import { Component, inject } from '@angular/core';
import { Shared } from '../../../shared/shared.module';
import { FormGroup } from '@angular/forms';
import { forgotPassForm } from '../../../shared/forms.config';
import { Subject } from 'rxjs';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-forgot-password',
  imports: [Shared],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  forgotPasswordForm:FormGroup = forgotPassForm
  isSubmitted:boolean = false
  validationMessages:{message:string, valid:boolean}[] = []
  destroy$ = new Subject<void>();
  authService = inject(AuthService)

 ngOnInit() {
  const passwordControl = this.forgotPasswordForm.get('new_password');
  const confirmControl = this.forgotPasswordForm.get('confirm_password');

  passwordControl?.valueChanges.subscribe((value) => {
    this.generateValidationMessages(value);

    // 🔥 IMPORTANT: revalidate confirm password
    confirmControl?.updateValueAndValidity();
  });
}


  generateValidationMessages(value:string){
    this.validationMessages = [
      { message: 'A minimum of 8 characters', valid: value.length >= 8 },
      { message: 'At least one uppercase letter', valid: /[A-Z]/.test(value) },
      { message: 'At least one lowercase letter', valid: /[a-z]/.test(value) },
      { message: 'At least one number', valid: /[0-9]/.test(value) },
    ]
  }

  submit(){
    this.isSubmitted = true
    this.forgotPasswordForm.markAllAsTouched()
    if(!this.forgotPasswordForm.valid || !this.validationMessages.every((message)=>message.valid)) return
    this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
      next:(res)=>{
        console.log(res)
        this.authService.router.navigate(['/sign-in'])
      },
      error:(err)=>{
        console.log(err)
      }
    })
    console.log(this.forgotPasswordForm.value)
  }

  ngOnDestroy(){
    this.destroy$.next()
    this.destroy$.complete()
  }

}




















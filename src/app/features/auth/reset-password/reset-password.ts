import { Component, inject } from '@angular/core';
import { Shared } from '../../../shared/shared.module';
import { FormGroup } from '@angular/forms';
import { resetPassForm } from '../../../shared/forms.config';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [Shared],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  resetPasswordForm:FormGroup = resetPassForm
  isSubmitted:boolean = false
  authService = inject(AuthService)

  submitForm(){
    this.isSubmitted = true
    this.resetPasswordForm.markAllAsTouched()
    if(!this.resetPasswordForm.valid) return
    this.authService.resetPassword(this.resetPasswordForm.value).subscribe({
      next:(res)=>{
        console.log(res)
        this.authService.router.navigate(['/forgot-password'])
      },
      error:(err)=>{
        console.log(err)
      }
    })
    console.log(this.resetPasswordForm.value)
  }

}

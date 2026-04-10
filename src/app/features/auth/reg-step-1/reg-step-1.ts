import { Component, inject } from '@angular/core';
import { Shared } from '../../../shared/shared.module';
import { FormGroup } from '@angular/forms';
import { regStep1Form } from '../../../shared/forms.config';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reg-step-1',
  imports: [Shared],
  templateUrl: './reg-step-1.html',
  styleUrl: './reg-step-1.scss',
})
export class RegStep1 {
  regStep1Form:FormGroup = regStep1Form
  isSubmitted:boolean = false
  authService = inject(AuthService)
  isLoading = this.authService.isLoading
  router:Router = inject(Router)


  submitForm(){
    this.regStep1Form.markAllAsTouched()
this.isSubmitted = true
if(!this.regStep1Form.valid) return
this.authService.registerStep1(this.regStep1Form.value).subscribe({
  next:(res)=>{
    console.log(res)
    this.router.navigate(['/reg-step-2'])
  },
  error:(err)=>{
    console.log(err)
  }
})
console.log(this.regStep1Form.value)
  }

}

import { Component, inject } from '@angular/core';
import { Shared } from '../../../shared/shared.module';
import { FormGroup } from '@angular/forms';
import { regFinalStepForm } from '../../../shared/forms.config';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-reg-step-4',
  imports: [Shared],
  templateUrl: './reg-step-4.html',
  styleUrl: './reg-step-4.scss',
})
export class RegStep4 {

  finalStepForm:FormGroup = regFinalStepForm
  isSubmitted:boolean = false
  authService = inject(AuthService)
  isLoading = this.authService.isLoading


    ngOnInit() {
    this.finalStepForm.get('role')?.valueChanges.subscribe(value => {
      console.log('Selected role:', value);
    });
  }

  get control(){
    return this.finalStepForm.get('role')
  }

  get errors(){
    return this.control?.errors ?? null
  }
  get showError(){
    if (!this.errors) return null
    if(this.control?.touched || this.control?.dirty){
      if (this.errors['required']) return 'Role is required'
    }
    return null
  }


  saveUser(){
    this.finalStepForm.markAllAsTouched()
    this.isSubmitted = true
    if(!this.finalStepForm.valid) return
    this.authService.regStep3(this.finalStepForm.value).subscribe({
      next:(res)=>{
        console.log(res)
        this.authService.clearAuthState()
        this.authService.router.navigate(['/sign-in'])
      },
      error:(err)=>{
        console.log(err)
      }
    })
    console.log(this.finalStepForm.value)
  }

}

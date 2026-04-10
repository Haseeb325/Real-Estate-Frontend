import { AbstractControl, FormControl, FormGroup , ValidationErrors, ValidatorFn, Validators} from "@angular/forms";

export const logingForm = new FormGroup({
    email: new FormControl('',[Validators.required,Validators.email]),
    password: new FormControl('',[Validators.required, Validators.minLength(8)])
})

export const regStep1Form = new FormGroup({
    email:new FormControl('',[Validators.required, Validators.email]),
    full_name:new FormControl('',[Validators.required,Validators.minLength(6)]),
    username:new FormControl('',[Validators.required, Validators.minLength(6)]),

})

export const regStep2Form = new FormGroup({
    otp:new FormControl('',[Validators.required, Validators.minLength(6)])
})


export const confirmPasswordMatch = (control:AbstractControl)=>{
const password = control.parent?.get('password')?.value
const cPassword = control.value

return password === cPassword ? null : {passwordMismatch:true}

}

export const regStep3Form = new FormGroup({
    password:new FormControl('',[Validators.required, Validators.minLength(8)]),
    confirm_password:new FormControl('',[Validators.required, Validators.minLength(8),confirmPasswordMatch])
});

export const regFinalStepForm = new FormGroup({
    role:new FormControl('',[Validators.required])
})


export const resetPassForm  = new FormGroup({
    email:new FormControl('',[Validators.required, Validators.email])
})




// export const passwordStrngthen = (control: AbstractControl): ValidationErrors | null => {
//   const value = control.value || '';

//   const errors: any = {};

//   if (value.length < 8) {

//     errors.minlength ={
//         requiredLength: 8,
//         actualLength: value.length
//     }
//   }
//   if (!/[A-Z]/.test(value)) {
//     errors.hasUpperCase = true;
//   }
//   if (!/[a-z]/.test(value)) {
//     errors.hasLowerCase = true;
//   }
//   if (!/[0-9]/.test(value)) {
//     errors.hasNumber = true;
//   }

//   return Object.keys(errors).length ? errors : null;
// };

export const forgotPassForm = new FormGroup({
  new_password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  confirm_password: new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    (control: AbstractControl): ValidationErrors | null => {
      const passwordControl = control.parent?.get('new_password');
      if (!passwordControl) return null;
      const password = passwordControl.value;
      const confirm = control.value;

      // trigger validation on confirm whenever password changes
      // keep this check shallow to avoid cross-dependency loops
      if (password && confirm && password !== confirm) {
        return { passwordMismatch: true };
      }

      return null;
    },
  ]),
});


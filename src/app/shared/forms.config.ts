import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export const logingForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', [Validators.required, Validators.minLength(8)]),
});

export const regStep1Form = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  full_name: new FormControl('', [Validators.required, Validators.minLength(6)]),
  username: new FormControl('', [Validators.required, Validators.minLength(6)]),
});

export const regStep2Form = new FormGroup({
  otp: new FormControl('', [Validators.required, Validators.minLength(6)]),
});

export const confirmPasswordMatch = (control: AbstractControl) => {
  const password = control.parent?.get('password')?.value;
  const cPassword = control.value;

  return password === cPassword ? null : { passwordMismatch: true };
};

export const regStep3Form = new FormGroup({
  password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  confirm_password: new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    confirmPasswordMatch,
  ]),
});

export const regFinalStepForm = new FormGroup({
  role: new FormControl('', [Validators.required]),
});

export const resetPassForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
});

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

// Buyer profile
export const buyerProfileForm = new FormGroup({
  phone: new FormControl('', [Validators.required, Validators.minLength(10)]),
  address: new FormControl('', [Validators.required]),
  city: new FormControl('', [Validators.required]),
  state: new FormControl('', [Validators.required]),
  country: new FormControl('', [Validators.required]),
  profile_image: new FormControl(''),
});

export const changePassword = new FormGroup({
  old_password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  new_password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  confirm_new_password: new FormControl('', [
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

export const PropertyForm = new FormGroup({
  title: new FormControl('', [Validators.required]),
  location: new FormControl('', [Validators.required]),
  property_type: new FormControl('', [Validators.required]),
  sale_type: new FormControl('', [Validators.required]),
  sale_price: new FormControl(''),
  rent_price: new FormControl(''),
  location_text: new FormControl('', [Validators.required]),
  security_deposit: new FormControl(''),
  // is_availabe:new FormControl(false),
  hero_image: new FormControl('', [Validators.required]),
  images: new FormControl<File[] | null>(null, [Validators.required]),

  houseDetails: new FormGroup({
    bathrooms: new FormControl(1, [Validators.required]),
    bedrooms: new FormControl(1, [Validators.required]),
    builtup_area: new FormControl(0, [Validators.required]),
    year_built: new FormControl(null, [Validators.required]),
    parking: new FormControl(''),
    plot_size: new FormControl(null),
    floors: new FormControl(null),
    features: new FormControl<any[]>([]),
    description: new FormControl(''),
    sub_type: new FormControl(''),
  }),

  commercialDetails: new FormGroup({
    commercial_type: new FormControl('commercial', [Validators.required]),
    commercial_subtype: new FormControl('', [Validators.required]),
    ownership: new FormControl('', [Validators.required]),
    builtup_area: new FormControl(0, [Validators.required]),
    useable_area: new FormControl('', [Validators.required]),
    floor_number: new FormControl('', [Validators.required]),
    frontage: new FormControl('', [Validators.required]),
    bathrooms: new FormControl(1, [Validators.required]),
    has_kitchen: new FormControl(false),
    furnishing: new FormControl('furnished', [Validators.required]),
    parking_details: new FormControl('', [Validators.required]),
    building_grade: new FormControl('A', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    features: new FormControl<any[]>([]),
  }),

  apartmentDetails: new FormGroup({
    bedrooms: new FormControl(1, [Validators.required]),
    bathrooms: new FormControl(1, [Validators.required]),
    builtup_area: new FormControl(0, [Validators.required]),
    parking: new FormControl(0),
    has_balcony: new FormControl(false),
    occupant_preference: new FormControl(''),
    features: new FormControl<any[]>([]),
    description: new FormControl(''),
    furnishing: new FormControl(''),
  }),

  plotsAndLandDetails: new FormGroup({
    plot_type: new FormControl(0, [Validators.required]),
    permitted_use: new FormControl(''),
    ownership: new FormControl(''),
    area: new FormControl(0, [Validators.required]),
    frontage: new FormControl(''),
    depth: new FormControl(''),
    facing: new FormControl(''),
    has_corner_plot: new FormControl(false),
    road_width: new FormControl(''),
    approval_by: new FormControl(''),
    possession_status: new FormControl(''),
    features: new FormControl<any[]>([]),
    description: new FormControl(''),
  }),
});

export const sellerProfileForm = new FormGroup({
  stripe_account_id: new FormControl(''),
  phone: new FormControl('', [Validators.required, Validators.minLength(10)]),
  profile_image: new FormControl('', [Validators.required]),
  company_name: new FormControl(''),
  city: new FormControl('', [Validators.required]),
  address: new FormControl('', [Validators.required]),
  state: new FormControl('', [Validators.required]),
  country: new FormControl('', [Validators.required]),
});

export const sellerDocsForm = new FormGroup({
  CNIC_Front: new FormControl('', [Validators.required]),
  CNIC_Back: new FormControl('', [Validators.required]),
  PAN_Card: new FormControl(''),
});

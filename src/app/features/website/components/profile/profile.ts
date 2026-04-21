import { Component, inject, signal, Signal, WritableSignal } from '@angular/core';
import { AuthStore } from '../../../../shared/authStore';
import { ProfileService } from './profile.service';
import { Shared } from '../../../../shared/shared.module';
import { getCloudinaryUrl } from "../../../../shared/utils/common-utils";
import { FormGroup } from '@angular/forms';
import { buyerProfileForm, changePassword } from '../../../../shared/forms.config';
import { URLConfig } from '../../../../shared/utils/url-config';
import { PopupBackdrop } from '../../../../components/popup-backdrop/popup-backdrop';
import { ToastService } from '../../../../core/services/toast.service';
import {ToastModule} from 'primeng/toast';
import { ChangePassword } from '../../../../components/change-password/change-password';


@Component({
  selector: 'app-profile',
  imports: [Shared, PopupBackdrop, ToastModule, ChangePassword],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {

  profileService = inject(ProfileService)

  readonly authStore = inject(AuthStore)
  readonly user = this.authStore.user
  readonly userProfile = this.profileService.profileData

  profileForm:FormGroup = buyerProfileForm
  isEditModalOpen = signal(false);
  isFormData:WritableSignal<boolean> = signal(false)
  imagePreview = signal<string | null>(null);
  toastService = inject(ToastService)
  openChangePasswordModal = signal(false)
  
ngOnInit() {
  this.profileData();
}


 profileData() {
  try {
     this.profileService.getProfile();
    // Logic inside an effect is better, but this works for debugging:
    console.log('Profile loaded successfully:', this.userProfile());
  } catch (error) {
    console.error("Profile could not be fetched", error);
  }
}

  openEditModal() {
  const profile = this.userProfile();
  if(profile){
    this.imagePreview.set(null);
    this.profileForm.patchValue({
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      profile_image: profile.profileImage
    })
  }
  this.isEditModalOpen.set(true);

  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileForm.patchValue({ profile_image: file });
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProfile() {
   if (this.profileForm.invalid) return
   const formValue = this.profileForm.value
   let payload:any
   let useFormData = false

   if(formValue.profile_image instanceof File){
    useFormData = true
    const formData = new FormData()
    // formData.append('phone', formValue.phone)
    // formData.append('address', formValue.address)
    // formData.append('city', formValue.city)
    // formData.append('state', formValue.state)
    // formData.append('country', formValue.country)
    // formData.append('profile_image', formValue.profile_image)
    // payload = formData
    // Append all form fields to FormData
    Object.keys(formValue).forEach(key => {
      const value = this.profileForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    })
    payload = formData
   }else{
    payload = formValue
    useFormData = false
   }

    return await this.profileService.updateProfile({
      url: URLConfig.buyerProfile,
      payload: payload,
      isFormData: useFormData,
      autoRefresh: true,
      autoRefreshUrl: URLConfig.buyerProfile,
      updateState: true,
    }).catch(error=>{
      console.error("Profile update failed", error)
      this.isEditModalOpen.set(false)
    }).finally(()=>{
      this.isEditModalOpen.set(false)
      this.imagePreview.set(null)
    })


  }
   getCloudinary = getCloudinaryUrl
}

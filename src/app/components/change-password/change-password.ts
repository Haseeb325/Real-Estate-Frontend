import { Component, EventEmitter, inject, Output, signal, WritableSignal } from '@angular/core';
import { Shared } from '../../shared/shared.module';
import { FormGroup } from '@angular/forms';
import { changePassword } from '../../shared/forms.config';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../shared/api.service';
import { firstValueFrom } from 'rxjs';
import { URLConfig } from '../../shared/utils/url-config';
import {ToastModule} from 'primeng/toast';

@Component({
  selector: 'app-change-password',
  imports: [Shared, ToastModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePassword {

  changePasswordForm:FormGroup = changePassword
  isLoading:WritableSignal<boolean> = signal(false)
  apiService = inject(ApiService)
  toastService = inject(ToastService)
  @Output() closeModal = new EventEmitter<void>()
  
  submitForm(){
    if(this.changePasswordForm.invalid) return
    this.isLoading.set(true)
    // Call API to change password
 
    const payload = this.changePasswordForm.value
    const response = firstValueFrom(this.apiService.post(URLConfig.changePassword,payload)).then((response:any) => {
      this.isLoading.set(false)
      this.toastService.success(response.message || 'Password changed successfully')
      this.closeModal.emit()
      // this.changePasswordForm.reset()
    }).catch((error) => {
      this.isLoading.set(false)
      this.toastService.error(error.error.message || 'Failed to change password')
    })
    // return response


  }


}

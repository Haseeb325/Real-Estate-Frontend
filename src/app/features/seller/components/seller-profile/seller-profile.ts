import { Component, OnInit, inject, signal } from '@angular/core';
import { Shared } from '../../../../shared/shared.module';
import { SellerProfileService } from '../seller-header/seller.profile.service';
import { sellerDocsForm, sellerProfileForm } from '../../../../shared/forms.config';
import { FormGroup } from '@angular/forms';
import { getCloudinaryUrl } from '../../../../shared/utils/common-utils';
import { PopupBackdrop } from '../../../../components/popup-backdrop/popup-backdrop';
import { ToastModule } from 'primeng/toast';
import { ChangePassword } from '../../../../components/change-password/change-password';

@Component({
  selector: 'app-seller-profile',
  imports: [Shared, PopupBackdrop, ToastModule, ChangePassword],
  templateUrl: './seller-profile.html',
  styleUrl: './seller-profile.scss',
})
export class SellerProfile implements OnInit {
  profileService = inject(SellerProfileService);

  user = this.profileService.user;
  userProfile = this.profileService.userProfileData;

  profileForm: FormGroup = sellerProfileForm;
  isEditModalOpen = signal(false);
  imagePreview = signal<string | null>(null);
  openChangePasswordModal = signal(false);

  docsForm: FormGroup = sellerDocsForm;
  cnicFrontPreview = signal<string | null>(null);
  cnicBackPreview = signal<string | null>(null);
  panCardPreview = signal<string | null>(null);
  userDocs = this.profileService.userDocs;

  ngOnInit() {
    this.fetchProfileData();
    this.loadDocs();
  }

  fetchProfileData() {
    this.profileService.fetchProfile().subscribe();
    this.profileService.getCurrentUser().subscribe();
  }
  isDocsModalOpen = signal(false);
  openDocsModal() {
    this.loadDocs();
    this.isDocsModalOpen.set(true);
  }
  loadDocs() {
    this.profileService.fetchDocs().subscribe();
  }

  openEditModal() {
    const profile = this.userProfile();
    if (profile) {
      this.imagePreview.set(null);
      this.profileForm.patchValue({
        stripe_account_id: profile.stripe_account_id,
        phone: profile.phone,
        company_name: profile.company_name,
        city: profile.city,
        address: profile.address,
        state: profile.state,
        country: profile.country,
        profile_image: profile.profile_image,
      });
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
    if (this.profileForm.invalid) return;
    const formValue = this.profileForm.value;
    let payload: any;

    if (formValue.profile_image instanceof File) {
      const formData = new FormData();
      Object.keys(formValue).forEach((key) => {
        const value = this.profileForm.get(key)?.value;
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      payload = formData;
    } else {
      // If it's not a File, we send JSON. We might want to remove the profile_image
      // if it's just the URL string to avoid issues, depending on backend.
      const { profile_image, ...jsonData } = formValue;
      payload = jsonData;
    }

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        this.isEditModalOpen.set(false);
        this.imagePreview.set(null);
      },
      error: (err) => {
        console.error('Profile update failed', err);
      },
    });
  }

  getCloudinary = getCloudinaryUrl;

  onDocFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.docsForm.patchValue({ [field]: file });
      const reader = new FileReader();
      reader.onload = () => {
        if (field === 'CNIC_Front') this.cnicFrontPreview.set(reader.result as string);
        if (field === 'CNIC_Back') this.cnicBackPreview.set(reader.result as string);
        if (field === 'PAN_Card') this.panCardPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveDocuments() {
    const formData = new FormData();
    const formValues: any = this.docsForm.value;
    let hasFiles = false;

    Object.keys(formValues).forEach((key) => {
      const val = formValues[key];
      if (val instanceof File) {
        formData.append(key, val);
        hasFiles = true;
      }
    });

    if (!hasFiles) {
      this.isDocsModalOpen.set(false);
      return;
    }

    this.profileService.uploadDocs(formData).subscribe({
      next: () => {
        this.cnicFrontPreview.set(null);
        this.cnicBackPreview.set(null);
        this.panCardPreview.set(null);
        this.isDocsModalOpen.set(false);
        this.docsForm.reset();
        this.loadDocs();
      },
    });
  }

  openDocsEditModal() {
    const docs = this.userDocs();
    if (docs) {
      this.docsForm.patchValue({
        CNIC_Front: docs.CNIC_Front,
        CNIC_Back: docs.CNIC_Back,
        PAN_Card: docs.PAN_Card,
      });
    }
    this.isDocsModalOpen.set(true);
  }
}

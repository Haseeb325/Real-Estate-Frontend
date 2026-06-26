import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthStore } from '../../shared/authStore';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../features/auth/auth.service';
import { Profile } from '../../features/website/components/profile/profile';
import { PopupBackdrop } from '../popup-backdrop/popup-backdrop';
import { ProfileService } from '../../features/website/components/profile/profile.service';
import { getCloudinaryUrl } from '../../shared/utils/common-utils';

@Component({
  selector: 'app-top-header',
  imports: [RouterLink,CommonModule,Profile, PopupBackdrop],
  templateUrl: './top-header.html',
  styleUrl: './top-header.scss',
})
export class TopHeader   {
  protected readonly authStore = inject(AuthStore);
  // Store the signal reference
  protected readonly user = this.authStore.user;
  protected readonly isAuthenticated = this.authStore.isAuthenticated;
  authService = inject(AuthService)
  profileService = inject(ProfileService)
  userProfile = this.profileService.profileData
  tempProfileImage = this.profileService.tempProfileImage
  openProfile:boolean = false

  ngOnInit(){
    console.log('TopHeader User Signal:', this.user());
    console.log('Authenticated',this.isAuthenticated())
    if(this.isAuthenticated()){
      this.profileService.getProfile()
    }
  }
  logout(){
this.authService.logoutUser()
  }

  closeProfile(){
    this.openProfile = false
  }

  getCloudinary = getCloudinaryUrl

}

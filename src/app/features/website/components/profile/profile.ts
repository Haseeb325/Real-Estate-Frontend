import { Component, inject } from '@angular/core';
import { AuthStore } from '../../../../shared/authStore';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {

  profileService = inject(ProfileService)

  readonly authStore = inject(AuthStore)
  readonly user = this.authStore.user
  readonly userProfile = this.profileService.profileData
  
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

}

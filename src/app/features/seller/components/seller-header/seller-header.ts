import { Component, OnInit, inject } from '@angular/core';
import { PopupBackdrop } from '../../../../components/popup-backdrop/popup-backdrop';
import { SellerProfile } from '../seller-profile/seller-profile';
import { SellerProfileService } from './seller.profile.service';
import { Shared } from '../../../../shared/shared.module';
import { RouterLink } from '@angular/router';
import { getCloudinaryUrl } from '../../../../shared/utils/common-utils';

@Component({
  selector: 'app-seller-header',
  imports: [PopupBackdrop, SellerProfile, Shared, RouterLink],
  templateUrl: './seller-header.html',
  styleUrl: './seller-header.scss',
})
export class SellerHeader implements OnInit {
  showProfile = false;
  mobileMenuOpen = false;

  sellerProfileService = inject(SellerProfileService);
  user = this.sellerProfileService.user;
  userProfile = this.sellerProfileService.userProfileData;
  tempProfileImage = this.sellerProfileService.tempProfileImage;

  ngOnInit(): void {
    this.getUser();
    this.sellerProfileService.fetchProfile().subscribe();
  }

  getUser() {
    this.sellerProfileService.getCurrentUser().subscribe({
      next: (res: any) => {
        console.log('user', res);
      },
      error: (err: any) => {
        console.log('err', err);
      },
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  getCloudinary = getCloudinaryUrl;
}

import { Component, OnInit, inject } from '@angular/core';
import { PopupBackdrop } from '../../../../components/popup-backdrop/popup-backdrop';
import { SellerProfile } from '../seller-profile/seller-profile';
import { SellerProfileService } from './seller.profile.service';
import { Shared } from '../../../../shared/shared.module';

@Component({
  selector: 'app-seller-header',
  imports: [PopupBackdrop, SellerProfile, Shared],
  templateUrl: './seller-header.html',
  styleUrl: './seller-header.scss',
})
export class SellerHeader implements OnInit {
  showProfile = false;

  sellerProfileService = inject(SellerProfileService);
  user = this.sellerProfileService.user;

  ngOnInit(): void {
    this.getUser();
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
}

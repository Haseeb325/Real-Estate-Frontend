import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ADMIN_SIDEBAR_DATA } from '../../data/sidebar.data';
import { AuthService } from '../../../auth/auth.service';
import { ListingVerificationStore } from '../../../../shared/stores/listing.verification.store';
import { SellerVerificationStore } from '../../../../shared/stores/seller.verification.store';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class AdminSidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private propertyVerifStore = inject(ListingVerificationStore);
  private sellerVerifStore = inject(SellerVerificationStore);

  /** Total pending verifications (properties + sellers) */
  pendingCount = computed(
    () => this.propertyVerifStore.totalCount() + this.sellerVerifStore.totalCount()
  );

  ngOnInit() {
    this.propertyVerifStore.loadPendingProperties({});
    this.sellerVerifStore.loadPendingSellers({});
  }

  readonly menuSections = ADMIN_SIDEBAR_DATA.map(section => ({
    ...section,
    items: section.items.map(item => {
      if (item.label === 'Logout') {
        return {
          ...item,
          action: () => {
            this.authService.logoutUser();
          }
        };
      }
      return item;
    })
  }));
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingVerificationStore } from '../../../../shared/stores/listing.verification.store';
import { SellerVerificationStore } from '../../../../shared/stores/seller.verification.store';
import { getCloudinaryUrl } from '../../../../shared/utils/common-utils';
import { sellerProfile } from '../../../../core/interfaces/seller';
import { Router } from '@angular/router';
import { PopupBackdrop } from '../../../../components/popup-backdrop/popup-backdrop';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-admin-verifications',
  standalone: true,
  imports: [CommonModule, PopupBackdrop, TooltipModule],
  templateUrl: './verifications.html',
  styles: [
    `
      .glass-tab {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .active-tab {
        background: rgba(34, 197, 94, 0.1);
        border-color: rgba(34, 197, 94, 0.3);
        color: #4ade80;
      }
      .glass-modal {
        background: rgba(10, 10, 10, 0.95);
        backdrop-filter: blur(30px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 40px 100px -12px rgba(0, 0, 0, 0.9);
      }
      .doc-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
      }
      .doc-card:hover {
        border-color: rgba(34, 197, 94, 0.3);
        background: rgba(255, 255, 255, 0.04);
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .flex-2 {
        flex: 2;
      }
    `,
  ],
})
export class VerificationsComponent implements OnInit {
  // Stores
  readonly propertyStore = inject(ListingVerificationStore);
  readonly sellerStore = inject(SellerVerificationStore);
  private router = inject(Router);

  // UI State
  activeTab = signal<'properties' | 'sellers'>('properties');
  selectedSeller = signal<sellerProfile | null>(null);

  getCloudinaryUrl = getCloudinaryUrl;

  ngOnInit() {
    this.refreshData();
  }

  refreshData(forceRefresh = false) {
    if (this.activeTab() === 'properties') {
      this.propertyStore.loadPendingProperties({}, forceRefresh);
    } else {
      this.sellerStore.loadPendingSellers({}, forceRefresh);
    }
  }

  setTab(tab: 'properties' | 'sellers') {
    this.activeTab.set(tab);
    this.refreshData(true);
  }

  // Property Actions
  onVerifyProperty(id: string | number) {
    this.propertyStore.verifyProperty(id).then(() => {
      this.refreshData(true);
    });
  }

  onRejectProperty(id: string | number) {
    this.propertyStore.rejectProperty(id).then(() => {
      this.refreshData(true);
    });
  }

  viewProperty(id: string | number) {
    this.router.navigate(['/admin/listings', id]);
  }

  // Seller Actions
  openSellerModal(seller: sellerProfile) {
    this.selectedSeller.set(seller);
  }

  closeSellerModal() {
    this.selectedSeller.set(null);
  }

  onApproveSeller(id: string | number) {
    this.sellerStore.approveSeller(id).then(() => {
      this.closeSellerModal();
      this.refreshData(true);
    });
  }

  onRejectSeller(id: string | number) {
    this.sellerStore.rejectSeller(id).then(() => {
      this.closeSellerModal();
      this.refreshData(true);
    });
  }
}

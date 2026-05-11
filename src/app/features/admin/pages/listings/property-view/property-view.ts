import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPropertyStore } from '../../../../../shared/stores/property.store';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Feature } from '../../../../../core/interfaces/property';
import { getCloudinaryUrl } from '../../../../../shared/utils/common-utils';
import { AdminStatsService } from '../../../admin.stats';

@Component({
  selector: 'app-admin-property-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-view.html',
  styles: [
    `
      .glass-card {
        background: rgba(10, 10, 10, 0.7);
        backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);
      }
      .spec-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.85rem 1.1rem;
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.02);
        font-size: 0.75rem;
        color: #9ca3af;
        border: 1px solid rgba(255, 255, 255, 0.01);
        transition: all 0.3s ease;
      }
      .spec-row:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.05);
        transform: translateX(4px);
      }
      .spec-row .val {
        color: #ffffff;
        font-weight: 900;
        letter-spacing: -0.02em;
        font-size: 0.85rem;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class AdminPropertyViewComponent implements OnInit {
  store = inject(AdminPropertyStore);
  route = inject(ActivatedRoute);

  // The property is automatically reactively available via the store
  property = this.store.selectedEntity;
  isLoading = this.store.isLoading;
  getCloudinaryUrl = getCloudinaryUrl;
  adminStats = inject(AdminStatsService);

  onViewMap() {
    const property = this.property();
    if (!property) return;
    const query = property.location_text || property.location || property.title;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(mapUrl, '_blank');
  }

  inactivateProperty(id: string | number) {
    this.store.inactivateProperty(id);
    // Refresh stats in background to keep dashboard up to date
    this.adminStats.getPropertyStats();
    this.adminStats.getDashboardStats();
  }

  activateProperty(id: string | number) {
    this.store.activateProperty(id);
    // Refresh stats in background
    this.adminStats.getPropertyStats();
    this.adminStats.getDashboardStats;
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      // Ensure data is loaded if user refreshes the page on this URL
      this.store.getPropertyDetails(id);
    }
  }

  /**
   * Helper function to extract features from any property sub-type
   */
  getFeatures(): Feature[] {
    const p = this.property();
    if (!p) return [];

    // Use OR operator to find features in whichever sub-type is present
    return (
      p.house?.features ||
      p.apartment?.features ||
      p.commercial?.features ||
      p.plots_and_land?.features ||
      []
    );
  }

  /**
   * Helper to format labels (e.g., builtup_area -> Built-up Area)
   */
  formatLabel(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getStatusColor(status: string = ''): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'inactive':
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'pause':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'sold':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  }
}

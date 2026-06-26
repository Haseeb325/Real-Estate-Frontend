import { Component, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Shared } from '../../../shared/shared.module';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { URLConfig } from '../../../shared/utils/url-config';
import {
  ColumnDef,
  DataTable,
  FilterDef,
  TableAction,
  activateButton,
  deleteButton,
  editButton,
  pauseButton,
  viewButton,
} from '../../../shared/components/data-table/data-table';
import { DashboardService } from './dashboard.service';
import { ToastService } from '../../../core/services/toast.service';
import { SellerAvailability } from '../components/seller-availability/seller-availability';
import { PopupBackdrop } from '../../../components/popup-backdrop/popup-backdrop';

@Component({
  selector: 'app-seller-dashboard',
  imports: [RouterLink, Shared, DataTable, SellerAvailability, PopupBackdrop],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.scss',
})
export class SellerDashboard {
  dashboardService = inject(DashboardService);
  params: any = { page: 1, page_size: 7 };
  apiService = inject(ApiService);
  stats: WritableSignal<any> = signal(null);
  selectedPropertyId = signal<string | null>(null);
  showAvailabilityPopup = signal(false);
  showNotVerifiedPopup = signal(false);
  userProfileService = inject(SellerProfileService);
  userData = this.userProfileService.userProfileData;

  activeCount = computed(() => this.stats()?.data.filter((p: any) => p.is_verified).length || 0);
  totalCount = computed(() => this.stats()?.count || 0);

  // Define Columns
  columns = signal<ColumnDef[]>([
    {
      field: 'hero_image',
      header: 'Icon',
      visible: true,
      type: 'image',
      value: (row) => row.hero_image,
    },
    { field: 'title', header: 'Property', visible: true },
    {
      field: 'price',
      header: 'Price / Rent',
      visible: true,
      value: (row) =>
        row.sale_type == 'both'
          ? `USD ${row.sale_price?.split('.')[0]} and ${row.rent_price?.split('.')[0]}/mo`
          : row.sale_type == 'sale'
            ? `USD ${row.sale_price?.split('.')[0]}`
            : row.sale_type == 'rent'
              ? `USD ${row.rent_price?.split('.')[0]}/mo`
              : `N/A`,
    },
    { field: 'property_type', header: 'Type', visible: true },
    {
      field: 'status',
      header: 'Status',
      visible: true,
      type: 'badge',
    },
  ]);

  // Define Filters to pass to the DataTable
  filters: FilterDef[] = [
    {
      field: 'property_type',
      label: 'Category',
      type: 'buttons',
      options: [
        { id: 'all', label: 'All' },
        { id: 'house', label: 'Houses' },
        { id: 'apartment', label: 'Apartments' },
        { id: 'plots_and_land', label: 'Plots & Land' },
        { id: 'commercial', label: 'Commercials' },
      ],
    },
    {
      field: 'search',
      label: 'Search listing...',
      type: 'search',
    },
    {
      field: 'sale_type',
      label: 'Mode',
      type: 'buttons',
      options: [
        { id: 'all', label: 'All' },
        { id: 'sale', label: 'Sale' },
        { id: 'rent', label: 'Rent' },
      ],
    },
    {
      field: 'status',
      label: 'Status',
      type: 'buttons',
      options: [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'pending', label: 'Pending' },
        { id: 'rejected', label: 'Rejected' },
        { id: 'pause', label: 'Paused' },
        { id: 'sold', label: 'Sold' },
      ],
    },
  ];

  filterChanged = async (event: any) => {
    // Clean up filters: remove 'all' values and empty searches
    const activeParams = Object.keys(event).reduce((acc: any, key) => {
      const value = event[key];
      if (value && value !== 'all') {
        acc[key] = value;
      }
      return acc;
    }, {});
    this.params = {
      page: 1,
      page_size: this.params.page_size || 7,
      ...activeParams,
    };

    console.log('Fetching with params:', this.params);
    try {
      const res: any = await firstValueFrom(
        this.dashboardService.getAllProperties(this.params, true),
      );
      if (res && res.status == 200) {
        // this.stats.set(res);
      }
    } catch (err) {
      console.log(err);
    }
  };

  onPageChange(page: any) {
    this.params = { ...this.params, page };
    console.log('--- Page Change Triggered ---');
    console.log('New Page:', page);
    console.log('Current Params:', this.params);
    this.loadProperties(true);
    this.loadStat();
  }

  rowActions = (row: any): TableAction[] => {
    if (!row) return [];
    return [
      {
        ...viewButton,
        command: () => {
          this.router.navigate(['/seller/property', row.id]);
        },
      },
      {
        ...editButton,
        disabled: (row) => row.status == 'sold' || row.status == 'reserved',
        command: () => {
          this.router.navigate(['/seller/edit-property', row.id]);
        },
      },
      {
        icon: 'pi pi-calendar',
        label: 'Set Availability',
        class: 'text-blue-500',
        disabled: (row) => row.status == 'sold' || row.status == 'reserved',
        command: () => {
          this.selectedPropertyId.set(row.id);
          this.showAvailabilityPopup.set(true);
        },
      },
      {
        ...deleteButton,
        disabled: (row) => row.status == 'sold' || row.status == 'reserved',
        command: async () => {
          this.dashboardService.loading.set(true);
          await firstValueFrom(this.apiService.delete(URLConfig.deleteSellerProperty(row.id)))
            .then((res: any) => {
              this.toastService.success(res);
            })
            .catch((error: any) => {
              this.toastService.error(error);
            })
            .finally(() => {
              this.loadProperties(true);
              this.loadStat();
            });
        },
      },
      {
        ...this.checkIfPauseOrActive(row),
        disabled: (row) => row.status == 'sold' || row.status == 'reserved',
        visible: (r: any) => row.status === 'active' || row.status === 'pause',
        command: () => {
          if (row.status === 'pause') {
            this.reactivateProperty(row.id);
          } else if (row.status === 'active') {
            this.pauseProperty(row.id);
          }
        },
      },
    ];
  };
  private router = inject(Router);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.loadStat();
    this.loadProperties(true);
  }

  handleCreateListingClick() {
    const profile = this.userData();
    if (profile?.is_verified_seller) {
      this.router.navigate(['/seller/create-listing']);
    } else {
      this.showNotVerifiedPopup.set(true);
    }
  }

  loadProperties(forceRefresh = false) {
    console.log('loadProperties calling service with:', this.params, 'forceRefresh:', forceRefresh);
    this.dashboardService.getAllProperties(this.params, forceRefresh).subscribe({
      next: (res: any) => {
        console.log('API Response in loadProperties:', res);
        if (res && res.status == 200) {
          // this.stats.set(res);
        }
      },
      error: (err) => {
        console.error('API Error in loadProperties:', err);
      },
    });
  }

  async loadStat() {
    try {
      const res: any = await firstValueFrom(this.apiService.get(URLConfig.getAllSellerProperties));
      if (res.status == 200) {
        this.stats.set(res);
      }
    } catch (error) {
      console.log(error);
    }
  }

  pauseProperty(id: any) {
    this.dashboardService.loading.set(true);
    this.apiService.post(URLConfig.pauseSellerProperty(id), {}).subscribe({
      next: (res: any) => {
        this.toastService.success(res.message);
      },
      error: (err) => {
        this.toastService.error(err.message || err || 'Something went wrong');
      },
      complete: () => {
        this.loadProperties(true);
        this.loadStat();
        this.dashboardService.loading.set(false);
      },
    });
  }

  reactivateProperty(id: any) {
    this.apiService.post(URLConfig.reactivateSellerProperty(id), {}).subscribe({
      next: (res: any) => {
        this.toastService.success(res.message);
      },
      error: (err) => {
        this.toastService.error(err.message || err || 'Something went wrong');
      },
      complete: () => {
        this.loadProperties(true);
        this.loadStat();
      },
    });
  }

  checkIfPauseOrActive(row: any) {
    if (row.status === 'pause') {
      return activateButton;
    } else if (row.status === 'active') {
      return pauseButton;
    }
    return { visible: (r: any) => false };
  }
}
import { SellerProfileService } from '../components/seller-header/seller.profile.service';

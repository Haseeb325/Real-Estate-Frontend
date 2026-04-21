import { Component, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Shared } from '../../../shared/shared.module';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../shared/api.service';
import { URLConfig } from '../../../shared/utils/url-config';
import { ColumnDef, DataTable, FilterDef, TableAction, deleteButton, editButton, viewButton } from '../../../shared/components/data-table/data-table';
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
        { id: 'paused', label: 'Paused' },
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
    return [
      {
        ...viewButton,
        command: () => {
          this.router.navigate(['/seller/property', row.id]);
        },
      },
      {
        ...editButton,
        command: () => {
          this.router.navigate(['/seller/edit-property', row.id]);
        },
      },
      {
        icon: 'pi pi-calendar',
        label: 'Set Availability',
        class: 'text-blue-500',
        command: () => {
          this.selectedPropertyId.set(row.id);
          this.showAvailabilityPopup.set(true);
        },
      },
      {
        ...deleteButton,
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
    ];
  };
  private router = inject(Router);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.loadStat();
    this.loadProperties(true);
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
}

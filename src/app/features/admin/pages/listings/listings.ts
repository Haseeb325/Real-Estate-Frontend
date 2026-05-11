import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgModules } from '../../../../shared/modules/primeng.modules';
import {
  ColumnDef,
  DataTable,
  FilterDef,
  TableAction,
} from '../../../../shared/components/data-table/data-table';
import { Shared } from '../../../../shared/shared.module';
import { UserStore } from '../../../../shared/stores/users.store';

import { AdminStatsService } from '../../admin.stats';
import { AdminPropertyStore } from '../../../../shared/stores/property.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-listings',
  standalone: true,
  styles: [
    `
      @keyframes dot-bounce {
        0%,
        80%,
        100% {
          transform: scale(0.6);
          opacity: 0.3;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
      .dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        margin: 0 2px;
        background-color: currentColor;
        border-radius: 50%;
        animation: dot-bounce 1.4s infinite ease-in-out both;
      }
      .dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      .dot:nth-child(2) {
        animation-delay: -0.16s;
      }
    `,
  ],
  imports: [CommonModule, PrimeNgModules, DataTable, Shared],
  templateUrl: './listings.html',
})
export class ListingsComponent {
  adminPropertyStore = inject(AdminPropertyStore);
  adminStats = inject(AdminStatsService);
  listingStats = this.adminStats.propertyStats;
  isLoading = this.adminPropertyStore.isLoading;

  ngOnInit() {
    if (this.adminStats.propertyStats() == null) {
      this.adminStats.getPropertyStats();
    }
    this.loadProperties();
    // if (this.adminPropertyStore.entities() == null) {
    //   this.loadProperties();
    // }
  }

  userStore = inject(UserStore);
  properties = this.adminPropertyStore.entities;
  params = {
    page: 1,
    page_size: 5,
    search: '',
    role: '',
    status: '',
  };

  router = inject(Router);

  columns = signal<ColumnDef[]>([
    // { field: 'id', header: 'ID', type: 'number', visible: false },
    {
      field: 'hero_image',
      header: 'icon',
      type: 'image',
      visible: true,
      value: (row: any) => row.hero_image,
      colSpan: 2,
    },
    { field: 'title', header: 'Title', type: 'text', visible: true, colSpan: 2 },
    {
      field: 'price',
      header: 'Price/Rent',
      type: 'number',
      visible: true,
      value: (row) =>
        row.sale_type == 'both'
          ? `PKR ${row.sale_price?.split('.')[0]} and ${row.rent_price?.split('.')[0]}/mo`
          : row.sale_type == 'sale'
            ? `PKR ${row.sale_price?.split('.')[0]}`
            : row.sale_type == 'rent'
              ? `PKR ${row.rent_price?.split('.')[0]}/mo`
              : `N/A`,
      colSpan: 2,
    },
    { field: 'property_type', header: 'Property Type', type: 'text', visible: true, colSpan: 2 },
    { field: 'status', header: 'Status', type: 'badge', visible: true, colSpan: 2 },
  ]);

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
  rowActions = (row: any): TableAction[] => [
    {
      label: 'inactive',
      icon: 'pi pi-ban',
      severity: 'danger',
      visible: (row) => row?.status?.toLowerCase() === 'active',
      command: (row) => {
        this.adminPropertyStore.inactivateProperty(row.id);
        this.adminStats.getPropertyStats();
      },
    },
    {
      label: 'Activate',
      icon: 'pi pi-check-circle',
      severity: 'success',
      visible: (row) => row?.status?.toLowerCase() === 'inactive',
      command: (row) => {
        this.adminPropertyStore.activateProperty(row.id);
        this.adminStats.getPropertyStats();
      },
    },
    {
      label: 'View',
      icon: 'pi pi-eye',
      severity: 'success',
      command: (row) => {
        this.router.navigate(['admin', 'listings', row.id]);
      },
    },
  ];

  loadProperties(forceRefresh = false) {
    this.adminPropertyStore.fetchProperties(this.params, forceRefresh);
  }

  onPageChange(page: any) {
    this.params = { ...this.params, page };
    this.loadProperties(true);
  }

  filterChanged(event: any) {
    this.params = {
      ...this.params,
      ...event,
      page: 1,
    };

    // Normalize 'all' values to empty strings for the API
    Object.keys(this.params).forEach((key) => {
      if (this.params[key as keyof typeof this.params] === 'all') {
        (this.params as any)[key] = '';
      }
    });

    this.loadProperties(true);
  }
}

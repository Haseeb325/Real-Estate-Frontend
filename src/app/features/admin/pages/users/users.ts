import { Component, inject, signal, computed } from '@angular/core';
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

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, PrimeNgModules, DataTable, Shared],
  templateUrl: './users.html',
})
export class UsersComponent {
  userStore = inject(UserStore);
  users = this.userStore.entities;
  isLoading = this.userStore.isLoading;

  /** Exclude admin accounts from the displayed list and count */
  nonAdminUsers = computed(() =>
    this.userStore.entities().filter((u: any) => u.role?.toLowerCase() !== 'admin')
  );
  nonAdminCount = computed(() =>
    this.userStore.totalCount() - this.userStore.entities().filter((u: any) => u.role?.toLowerCase() === 'admin').length
  );

  params = {
    page: 1,
    page_size: 10,
    search: '',
    role: '',
    status: '',
  };

  columns = signal<ColumnDef[]>([
    // { field: 'id', header: 'ID', type: 'number', visible: false },
    { field: 'username', header: 'Username', type: 'text', visible: true, colSpan: 2 },
    { field: 'fullName', header: 'Name', type: 'text', visible: true, colSpan: 2 },
    { field: 'email', header: 'Email', type: 'text', visible: true, colSpan: 2 },
    { field: 'role', header: 'Role', type: 'badge', visible: true, colSpan: 2 },
    { field: 'status', header: 'Status', type: 'badge', visible: true, colSpan: 2 },
  ]);

  filters: FilterDef[] = [
    {
      field: 'search',
      label: 'Search users...',
      type: 'search',
    },
    {
      field: 'role',
      label: 'Role',
      type: 'buttons',
      options: [
        { id: 'all', label: 'All' },
        { id: 'buyer', label: 'Buyer' },
        { id: 'seller', label: 'Seller' },
      ],
      defaultValue: 'all',
    },
    {
      field: 'status',
      label: 'Status',
      type: 'buttons',
      options: [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'suspended', label: 'Suspended' },
      ],
      defaultValue: 'all',
    },
  ];
  rowActions = (row: any): TableAction[] => [
    {
      label: 'Suspend',
      icon: 'pi pi-ban',
      severity: 'danger',
      visible: (row) => row?.status?.toLowerCase() === 'active',
      command: (row) => this.userStore.suspendUser(row.id),
    },
    {
      label: 'Activate',
      icon: 'pi pi-check-circle',
      severity: 'success',
      visible: (row) => row?.status?.toLowerCase() === 'suspended',
      command: (row) => this.userStore.activateUser(row.id),
    },
  ];

  ngOnInit() {
    this.loadUsers();
    console.log(this.users());
  }

  loadUsers(forceRefresh = false) {
    this.userStore.fetchUsers({ ...this.params, exclude_role: 'admin' }, forceRefresh);
  }

  onPageChange(page: any) {
    this.params = { ...this.params, page };
    this.loadUsers(true);
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

    this.loadUsers(true);
  }
}

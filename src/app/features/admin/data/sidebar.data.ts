export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

export interface SidebarSection {
  section: string;
  items: MenuItem[];
}

export const ADMIN_SIDEBAR_DATA: SidebarSection[] = [
  {
    section: 'Navigation',
    items: [
      {
        label: 'Dashboard',
        icon: 'fas fa-chart-line',
        route: '/admin/dashboard',
        exact: true,
      },
      {
        label: 'Users',
        icon: 'fas fa-users',
        route: '/admin/users',
      },
      {
        label: 'Listings',
        icon: 'fas fa-list',
        route: '/admin/listings',
      },
      {
        label: 'Verifications',
        icon: 'fas fa-check-circle',
        route: '/admin/verifications',
      },
      {
        label: 'Payments',
        icon: 'fas fa-money-bill',
        route: '/admin/payments',
      },
    ],
  },
  {
    section: 'Account',
    items: [
      {
        label: 'Settings',
        icon: 'fas fa-cog',
        route: '/admin/settings',
      },
      {
        label: 'Logout',
        icon: 'fas fa-sign-out-alt',
        route: '/auth/logout',
      },
    ],
  },
];

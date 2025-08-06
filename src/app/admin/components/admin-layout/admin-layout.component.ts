import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { AdminService } from '../../services/admin.service';
import { AdminPermission } from '../../models/admin.model';
import { CategoryFormDialogComponent } from '../category-form-dialog/category-form-dialog.component';

interface NavigationItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly permission?: AdminPermission;
  readonly children?: NavigationItem[];
}

@Component({
  selector: 'app-admin-layout',
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isHandset = signal(false);
  readonly sidenavOpened = signal(true);

  readonly currentAdmin = computed(() => this.adminService.currentAdmin());
  readonly adminName = computed(() => {
    const admin = this.currentAdmin();
    return admin ? `${admin.firstName} ${admin.lastName}` : '';
  });

  readonly navigationItems: NavigationItem[] = [
    {
      label: 'داشبورد',
      icon: 'dashboard',
      route: '/admin/dashboard'
    },
    {
      label: 'مدیریت محصولات',
      icon: 'inventory_2',
      route: '/admin/products',
      permission: AdminPermission.MANAGE_PRODUCTS,
      children: [
        {
          label: 'لیست محصولات',
          icon: 'list',
          route: '/admin/products'
        },
        {
          label: 'افزودن محصول',
          icon: 'add',
          route: '/admin/products/create'
        },
        {
          label: 'دسته‌بندی‌ها',
          icon: 'category',
          route: '/admin/categories'
        }
      ]
    },
    {
      label: 'مدیریت سفارشات',
      icon: 'shopping_cart',
      route: '/admin/orders',
      permission: AdminPermission.MANAGE_ORDERS
    },
    {
      label: 'مدیریت کاربران',
      icon: 'people',
      route: '/admin/users',
      permission: AdminPermission.MANAGE_USERS
    },
    {
      label: 'گزارشات و آمار',
      icon: 'analytics',
      route: '/admin/analytics',
      permission: AdminPermission.VIEW_ANALYTICS
    }
    // {
    //   label: 'مدیریت ادمین‌ها',
    //   icon: 'admin_panel_settings',
    //   route: '/admin/admins',
    //   permission: AdminPermission.MANAGE_ADMINS
    // }
  ];

  readonly visibleNavigationItems = computed(() => 
    this.navigationItems.filter(item => 
      !item.permission || this.adminService.hasPermission(item.permission)
    )
  );

  constructor() {
    // Monitor screen size for responsive behavior
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isHandset.set(result.matches);
        // For RTL layout, keep sidenav open by default
        this.sidenavOpened.set(true);
      });
    
    // Initialize sidenav as open
    this.sidenavOpened.set(true);
  }

  toggleSidenav(): void {
    this.sidenavOpened.update(opened => !opened);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    
    // Close sidenav on mobile after navigation
    if (this.isHandset()) {
      this.sidenavOpened.set(false);
    }
  }

  logout(): void {
    this.adminService.logout();
    this.router.navigate(['/admin/login']);
  }

  goToMainSite(): void {
    this.router.navigate(['/']);
  }

  hasPermission(permission: AdminPermission): boolean {
    return this.adminService.hasPermission(permission);
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}
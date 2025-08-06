import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin-products/admin-products.component';
import { AdminProductCreateComponent } from './pages/admin-product-create/admin-product-create.component';
import { AdminProductEditComponent } from './pages/admin-product-edit/admin-product-edit.component';
import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
import { AdminAnalyticsComponent } from './pages/admin-analytics/admin-analytics.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminPermission } from './models/admin.model';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminAuthGuard],
    canActivateChild: [AdminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent 
      },
      { 
        path: 'products', 
        component: AdminProductsComponent,
        data: { permission: AdminPermission.MANAGE_PRODUCTS }
      },
      { 
        path: 'products/create', 
        component: AdminProductCreateComponent,
        data: { permission: AdminPermission.MANAGE_PRODUCTS }
      },
      { 
        path: 'products/edit/:id', 
        component: AdminProductEditComponent,
        data: { permission: AdminPermission.MANAGE_PRODUCTS }
      },
      { 
        path: 'categories', 
        component: AdminCategoriesComponent,
        data: { permission: AdminPermission.MANAGE_CATEGORIES }
      },
      { 
        path: 'orders', 
        component: AdminOrdersComponent, 
        data: { permission: AdminPermission.MANAGE_ORDERS } 
      },
      { 
        path: 'users', 
        component: AdminUsersComponent, 
        data: { permission: AdminPermission.MANAGE_USERS } 
      },
      { 
        path: 'analytics', 
        component: AdminAnalyticsComponent, 
        data: { permission: AdminPermission.VIEW_ANALYTICS } 
      },
      // Future admin routes will be added here
      // { path: 'admins', component: AdminAdminsComponent, data: { permission: AdminPermission.MANAGE_ADMINS } },
    ]
  },
];

export const AdminRoutes = RouterModule.forChild(routes);

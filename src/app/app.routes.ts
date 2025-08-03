import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { CartComponent } from './pages/cart/cart.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin-products/admin-products.component';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
import { AdminAuthGuard } from './shared/guards/admin-auth.guard';
import { AdminPermission } from './models/admin.model';

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'cart', component: CartComponent },
  
  // Admin routes
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
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
        path: 'orders', 
        component: AdminOrdersComponent, 
        data: { permission: AdminPermission.MANAGE_ORDERS } 
      },
      // Future admin routes will be added here
      // { path: 'users', component: AdminUsersComponent, data: { permission: AdminPermission.MANAGE_USERS } },
      // { path: 'admins', component: AdminAdminsComponent, data: { permission: AdminPermission.MANAGE_ADMINS } },
    ]
  },
  
  // Redirect any unknown routes to home
  { path: '**', redirectTo: '' }
];

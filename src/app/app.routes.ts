import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { CartComponent } from './pages/cart/cart.component';
import { AdminLayoutComponent } from './admin/components/admin-layout/admin-layout.component';
import { AdminLoginComponent } from './admin/pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/pages/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './admin/pages/admin-products/admin-products.component';
import { AdminProductCreateComponent } from './admin/pages/admin-product-create/admin-product-create.component';
import { AdminProductEditComponent } from './admin/pages/admin-product-edit/admin-product-edit.component';
import { AdminCategoriesComponent } from './admin/pages/admin-categories/admin-categories.component';
import { AdminUsersComponent } from './admin/pages/admin-users/admin-users.component';
import { AdminOrdersComponent } from './admin/pages/admin-orders/admin-orders.component';
import { AdminAuthGuard } from './admin/guards/admin-auth.guard';
import { AdminPermission } from './admin/models/admin.model';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminAnalyticsComponent } from './admin/pages/admin-analytics/admin-analytics.component';

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
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
  
  // Redirect any unknown routes to home
  { path: '**', redirectTo: '' }
];

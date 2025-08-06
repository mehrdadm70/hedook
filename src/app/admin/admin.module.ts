import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Standalone Components (imported)
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin-products/admin-products.component';
import { AdminProductCreateComponent } from './pages/admin-product-create/admin-product-create.component';
import { AdminProductEditComponent } from './pages/admin-product-edit/admin-product-edit.component';
import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
import { AdminAnalyticsComponent } from './pages/admin-analytics/admin-analytics.component';

// Dialog Components
import { CategoryFormDialogComponent } from './components/category-form-dialog/category-form-dialog.component';
import { OrderDetailDialogComponent } from './components/order-detail-dialog/order-detail-dialog.component';
import { UserFormDialogComponent } from './components/user-form-dialog/user-form-dialog.component';

// Guards
import { AdminAuthGuard } from './guards/admin-auth.guard';

// Services
import { AdminService } from './services/admin.service';

// Routing
import { AdminRoutes } from './admin.routing';
import { AdminComponent } from './admin.component';

@NgModule({
  declarations: [
    AdminComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    // Angular Material Modules
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    AdminRoutes,
    // Import all components as standalone
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminProductsComponent,
    AdminProductCreateComponent,
    AdminProductEditComponent,
    AdminCategoriesComponent,
    AdminUsersComponent,
    AdminOrdersComponent,
    AdminAnalyticsComponent,
    CategoryFormDialogComponent,
    OrderDetailDialogComponent,
    UserFormDialogComponent
  ],
  providers: [
    AdminAuthGuard,
    AdminService
  ]
})
export class AdminModule { }

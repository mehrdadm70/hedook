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
import { OrderDetailDialogComponent } from './components/order-detail-dialog/order-detail-dialog.component';
import { UserFormDialogComponent } from './components/user-form-dialog/user-form-dialog.component';
import { CategoryFormDialogComponent } from './components/category-form-dialog/category-form-dialog.component';

// Guards
import { AdminAuthGuard } from './guards/admin-auth.guard';

// Services
import { AdminService } from './services/admin.service';

// Routing
import { AdminRoutes } from './admin.routing';
import { AdminComponent } from './admin.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { OverlayModule } from '@angular/cdk/overlay';

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
    // Angular Material Modules for dialogs
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    OverlayModule,
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
    OrderDetailDialogComponent,
    UserFormDialogComponent,
    CategoryFormDialogComponent
  ],
  providers: [
    AdminAuthGuard,
    AdminService
  ]
})
export class AdminModule { }

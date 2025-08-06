import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AdminService } from '../services/admin.service';
import { AdminPermission } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate, CanActivateChild {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAdminAccess(route);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAdminAccess(childRoute);
  }

  private checkAdminAccess(route: ActivatedRouteSnapshot): boolean {
    const isAuthenticated = this.adminService.isAuthenticated();
    
    if (!isAuthenticated) {
      this.router.navigate(['/admin/login']);
      return false;
    }

    // Check for specific permissions if required
    const requiredPermission = route.data?.['permission'] as AdminPermission;
    if (requiredPermission && !this.adminService.hasPermission(requiredPermission)) {
      this.router.navigate(['/admin/unauthorized']);
      return false;
    }

    return true;
  }
}
import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { Order, OrderStatus } from '../../../models/order.model';

export interface OrderDetailDialogData {
  order: Order;
}

@Component({
  selector: 'app-order-detail-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './order-detail-dialog.component.html',
  styleUrl: './order-detail-dialog.component.scss'
})
export class OrderDetailDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<OrderDetailDialogComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);

  readonly order = this.data.order;
  readonly OrderStatus = OrderStatus;

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'در انتظار';
      case OrderStatus.CONFIRMED: return 'تایید شده';
      case OrderStatus.SHIPPED: return 'ارسال شده';
      case OrderStatus.DELIVERED: return 'تحویل داده شده';
      case OrderStatus.CANCELLED: return 'لغو شده';
      default: return status;
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'warn';
      case OrderStatus.CONFIRMED: return 'primary';
      case OrderStatus.SHIPPED: return 'accent';
      case OrderStatus.DELIVERED: return 'primary';
      case OrderStatus.CANCELLED: return 'warn';
      default: return 'primary';
    }
  }

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'online': return 'آنلاین';
      case 'cash_on_delivery': return 'پرداخت در محل';
      default: return method;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  close(): void {
    this.dialogRef.close();
  }
} 
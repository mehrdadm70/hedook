export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export enum AdminPermission {
  MANAGE_PRODUCTS = 'manage_products',
  MANAGE_ORDERS = 'manage_orders',
  MANAGE_USERS = 'manage_users',
  MANAGE_ADMINS = 'manage_admins',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_CATEGORIES = 'manage_categories',
  MANAGE_INVENTORY = 'manage_inventory'
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  topSellingProducts: ProductSalesStats[];
  recentOrders: RecentOrderInfo[];
}

export interface ProductSalesStats {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
  image: string;
}

export interface RecentOrderInfo {
  orderId: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  admin: Admin;
  token: string;
  expiresIn: number;
}

export interface CreateAdminDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions: AdminPermission[];
}

export interface UpdateAdminDto extends Partial<Omit<CreateAdminDto, 'password'>> {
  id: string;
  newPassword?: string;
}
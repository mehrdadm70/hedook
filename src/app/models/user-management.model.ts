export interface User {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly avatar?: string;
  readonly isActive: boolean;
  readonly emailVerified: boolean;
  readonly phoneVerified: boolean;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLogin?: Date;
  readonly totalOrders: number;
  readonly totalSpent: number;
}

export interface CreateUserDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly password: string;
  readonly role?: UserRole;
  readonly isActive?: boolean;
}

export interface UpdateUserDto {
  readonly id: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly role?: UserRole;
  readonly isActive?: boolean;
}

export interface UserFilter {
  readonly search?: string;
  readonly role?: UserRole;
  readonly isActive?: boolean;
  readonly emailVerified?: boolean;
  readonly dateRange?: {
    readonly start: Date;
    readonly end: Date;
  };
}

export enum UserRole {
  CUSTOMER = 'customer',
  VIP_CUSTOMER = 'vip_customer',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

export interface UserStats {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly newUsersThisMonth: number;
  readonly vipUsers: number;
  readonly usersWithOrders: number;
  readonly averageOrdersPerUser: number;
  readonly topSpenders: Array<{
    readonly userId: string;
    readonly userName: string;
    readonly totalSpent: number;
    readonly orderCount: number;
  }>;
} 
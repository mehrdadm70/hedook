export interface AnalyticsOverview {
  readonly totalRevenue: number;
  readonly totalOrders: number;
  readonly totalProducts: number;
  readonly totalUsers: number;
  readonly averageOrderValue: number;
  readonly conversionRate: number;
  readonly monthlyGrowth: number;
  readonly yearOverYearGrowth: number;
}

export interface RevenueAnalytics {
  readonly totalRevenue: number;
  readonly monthlyRevenue: number;
  readonly dailyRevenue: number;
  readonly revenueByPeriod: RevenueByPeriod[];
  readonly topRevenueSources: RevenueSource[];
  readonly revenueTrend: RevenueTrendPoint[];
}

export interface RevenueByPeriod {
  readonly period: string;
  readonly revenue: number;
  readonly orders: number;
  readonly growth: number;
}

export interface RevenueSource {
  readonly source: string;
  readonly revenue: number;
  readonly percentage: number;
  readonly orders: number;
}

export interface RevenueTrendPoint {
  readonly date: Date;
  readonly revenue: number;
  readonly orders: number;
}

export interface SalesAnalytics {
  readonly totalSales: number;
  readonly totalUnits: number;
  readonly averageOrderValue: number;
  readonly salesByCategory: SalesByCategory[];
  readonly topSellingProducts: TopSellingProduct[];
  readonly salesTrend: SalesTrendPoint[];
}

export interface SalesByCategory {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly sales: number;
  readonly units: number;
  readonly percentage: number;
}

export interface TopSellingProduct {
  readonly productId: string;
  readonly productName: string;
  readonly category: string;
  readonly unitsSold: number;
  readonly revenue: number;
  readonly image: string;
  readonly growth: number;
}

export interface SalesTrendPoint {
  readonly date: Date;
  readonly sales: number;
  readonly units: number;
  readonly orders: number;
}

export interface CustomerAnalytics {
  readonly totalCustomers: number;
  readonly newCustomers: number;
  readonly activeCustomers: number;
  readonly customerRetentionRate: number;
  readonly averageCustomerValue: number;
  readonly customerSegments: CustomerSegment[];
  readonly customerGrowth: CustomerGrowthPoint[];
}

export interface CustomerSegment {
  readonly segment: string;
  readonly count: number;
  readonly percentage: number;
  readonly averageValue: number;
}

export interface CustomerGrowthPoint {
  readonly date: Date;
  readonly totalCustomers: number;
  readonly newCustomers: number;
  readonly activeCustomers: number;
}

export interface ProductAnalytics {
  readonly totalProducts: number;
  readonly activeProducts: number;
  readonly lowStockProducts: number;
  readonly outOfStockProducts: number;
  readonly productsByCategory: ProductByCategory[];
  readonly inventoryValue: number;
  readonly averageProductRating: number;
}

export interface ProductByCategory {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly productCount: number;
  readonly totalValue: number;
  readonly averagePrice: number;
}

export interface OrderAnalytics {
  readonly totalOrders: number;
  readonly pendingOrders: number;
  readonly completedOrders: number;
  readonly cancelledOrders: number;
  readonly averageOrderValue: number;
  readonly ordersByStatus: OrderByStatus[];
  readonly orderTrend: OrderTrendPoint[];
}

export interface OrderByStatus {
  readonly status: string;
  readonly count: number;
  readonly percentage: number;
  readonly totalValue: number;
}

export interface OrderTrendPoint {
  readonly date: Date;
  readonly orders: number;
  readonly revenue: number;
  readonly averageValue: number;
}

export interface GeographicAnalytics {
  readonly topRegions: GeographicRegion[];
  readonly salesByRegion: SalesByRegion[];
  readonly customerDistribution: CustomerDistribution[];
}

export interface GeographicRegion {
  readonly region: string;
  readonly sales: number;
  readonly orders: number;
  readonly customers: number;
  readonly growth: number;
}

export interface SalesByRegion {
  readonly region: string;
  readonly sales: number;
  readonly percentage: number;
  readonly growth: number;
}

export interface CustomerDistribution {
  readonly region: string;
  readonly customers: number;
  readonly percentage: number;
}

export interface TimeRange {
  readonly start: Date;
  readonly end: Date;
  readonly label: string;
}

export interface AnalyticsFilter {
  readonly timeRange: TimeRange;
  readonly categories?: string[];
  readonly regions?: string[];
  readonly statuses?: string[];
}

export interface AnalyticsExport {
  readonly type: 'pdf' | 'excel' | 'csv';
  readonly data: any;
  readonly filename: string;
  readonly timestamp: Date;
}

export interface ChartData {
  readonly labels: string[];
  readonly datasets: ChartDataset[];
}

export interface ChartDataset {
  readonly label: string;
  readonly data: number[];
  readonly backgroundColor?: string | string[];
  readonly borderColor?: string | string[];
  readonly borderWidth?: number;
  readonly fill?: boolean;
}

export interface AnalyticsSummary {
  readonly overview: AnalyticsOverview;
  readonly revenue: RevenueAnalytics;
  readonly sales: SalesAnalytics;
  readonly customers: CustomerAnalytics;
  readonly products: ProductAnalytics;
  readonly orders: OrderAnalytics;
  readonly geographic: GeographicAnalytics;
} 
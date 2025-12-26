export interface SalesRecord {
  recordUpdateDate: string;
  recordAddDate: string;
  memberId: string;
  transactionNumber: string;
  purchaseDate: string;
  cardNumber: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  storeCode: string;
  storeName: string;
  staffCode: string;
  staffName: string;
  brand: string;
  collectionCode: string;
  collectionName: string;
  productCategoryCode: string;
  productCategoryName: string;
  itemCode: string;
  itemName: string;
  materialCode: string;
  materialName: string;
  colorCode: string;
  colorName: string;
  transactionType: string;
}

export interface MemberRecord {
  memberId: string;
  birthDate: string | null;
  gender: string | null;
  newsletterFlag: string;
  dmFlag: string;
  favoriteStore: string | null;
  importantPersonBirthday: string | null;
  anniversary: string | null;
  firstRegisteredStore: string | null;
}

export interface KPIMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  activeCustomers: number;
}

export interface CategorySales {
  date: string;
  [category: string]: string | number;
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  transactions: number;
  customers: number;
}

export interface BirthdaySalesData {
  daysFromBirthday: number;
  salesCount: number;
  revenue: number;
  transactions: number;
}

export interface ProductPerformance {
  productName: string;
  productCode: string;
  revenue: number;
  quantity: number;
  transactions: number;
  averagePrice: number;
}

export interface StorePerformance {
  storeName: string;
  storeCode: string;
  revenue: number;
  transactions: number;
  customers: number;
  averageOrderValue: number;
}

export interface AttributeTrend {
  date: string;
  [attribute: string]: string | number;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  totalRevenue: number;
  averageRevenue: number;
  percentage: number;
}

export interface DayOfWeekData {
  day: string;
  revenue: number;
  transactions: number;
  customers: number;
}

export interface CustomerDetail {
  memberId: string;
  totalRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  daysSinceLastPurchase: number;
  preferredStore: string;
  preferredCategory: string;
  isOnlineCustomer: boolean;
}

export interface RFMSegment {
  segment: string;
  description: string;
  count: number;
  totalRevenue: number;
  averageRevenue: number;
  percentage: number;
  rScore: number; // Recency score (1-4)
  fScore: number; // Frequency score (1-4)
  mScore: number; // Monetary score (1-4)
}

export interface SegmentationDimension {
  dimension: string;
  segments: CustomerSegment[];
}

// Funnel Analysis Types
export interface AcquisitionMetrics {
  period: string;
  newCustomers: number;
  returningCustomers: number;
  newCustomerRevenue: number;
  returningCustomerRevenue: number;
  newCustomerAOV: number;
  returningCustomerAOV: number;
}

export interface FirstPurchaseAnalysis {
  totalNewCustomers: number;
  averageFirstPurchaseValue: number;
  averageTimeToFirstPurchase: number;
  firstPurchaseCategories: {
    category: string;
    count: number;
    revenue: number;
  }[];
  firstPurchaseByMonth: { month: string; count: number; revenue: number }[];
}

export interface PurchaseInterval {
  customerId: string;
  averageInterval: number;
  purchaseCount: number;
  intervals: number[];
}

export interface PurchaseIntervalDistribution {
  intervalRange: string;
  customerCount: number;
  percentage: number;
}

export interface FirstRepeatAnalysis {
  firstPurchaseValue: number;
  repeatPurchaseValue: number;
  secondPurchaseRate: number;
  averageDaysToSecondPurchase: number;
  categoryProgression: {
    category: string;
    firstPurchase: number;
    repeatPurchase: number;
  }[];
}

export interface BasketAnalysis {
  transactionNumber: string;
  itemCount: number;
  totalValue: number;
  items: string[];
}

export interface ProductAffinity {
  productA: string;
  productB: string;
  coOccurrence: number;
  support: number;
  confidence: number;
}

export interface CohortData {
  cohort: string; // Month/Quarter of first purchase
  customers: number;
  period0: number; // First period revenue
  period1: number;
  period2: number;
  period3: number;
  period4: number;
  period5: number;
  totalRevenue: number;
  averageLTV: number;
  retentionRate: number;
}

export interface LTVAnalysis {
  period: string;
  averageLTV: number;
  medianLTV: number;
  ltvBySegment: { segment: string; averageLTV: number; count: number }[];
  ltvTrend: number[];
}

export interface ChurnMetrics {
  period: string;
  activeCustomers: number;
  churnedCustomers: number;
  churnRate: number;
  retentionRate: number;
  newCustomers: number;
  netCustomerGrowth: number;
}

export interface PurchaseCycleSegment {
  segment: string;
  count: number;
  averageInterval: number;
  averageRevenue: number;
  percentage: number;
}

export interface ProductTrend {
  date: string;
  [productName: string]: string | number;
}

export interface BrandCollectionPerformance {
  name: string;
  type: "brand" | "collection";
  revenue: number;
  quantity: number;
  transactions: number;
  averagePrice: number;
  productCount: number;
}

export interface ProductStorePerformance {
  productName: string;
  productCode: string;
  storeName: string;
  storeCode: string;
  revenue: number;
  quantity: number;
  transactions: number;
}

export interface PerformanceWithStoreBreakdown {
  name: string;
  totalRevenue: number;
  stores: {
    storeName: string;
    revenue: number;
  }[];
}

export interface CollectionTrend {
  date: string;
  [collectionName: string]: string | number;
}

export interface StoreTrend {
  date: string;
  [storeName: string]: string | number;
}

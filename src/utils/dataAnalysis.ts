import type {
  SalesRecord,
  KPIMetrics,
  CategorySales,
  TimeSeriesData,
  BirthdaySalesData,
  MemberRecord,
  ProductPerformance,
  StorePerformance,
  AttributeTrend,
  CustomerSegment,
  DayOfWeekData,
  CustomerDetail,
  RFMSegment,
  RFMMatrixCell,
  ProductTrend,
  BrandCollectionPerformance,
  ProductStorePerformance,
  PerformanceWithStoreBreakdown,
  CollectionTrend,
  StoreTrend,
  EmployeePerformance,
} from "../types";

export function calculateKPIs(salesData: SalesRecord[]): KPIMetrics {
  const totalRevenue = salesData.reduce(
    (sum, record) => sum + record.amount,
    0
  );
  const totalTransactions = new Set(salesData.map((r) => r.transactionNumber))
    .size;
  const averageOrderValue =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const activeCustomers = new Set(salesData.map((r) => r.memberId)).size;

  return {
    totalRevenue,
    totalTransactions,
    averageOrderValue,
    activeCustomers,
  };
}

export function getCategorySalesOverTime(
  salesData: SalesRecord[],
  granularity: Granularity = "monthly"
): CategorySales[] {
  // Group by granularity and category
  const categoryMap = new Map<string, Map<string, number>>();

  salesData.forEach((record) => {
    const dateStr = record.purchaseDate;
    if (!dateStr) return;

    // Handle date format YYYY-MM-DD
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return;

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);

    const periodKey = getDateKey(date, granularity);
    const category = record.itemName || record.productCategoryName || "その他";

    if (!categoryMap.has(periodKey)) {
      categoryMap.set(periodKey, new Map());
    }

    const periodCategoryMap = categoryMap.get(periodKey)!;
    periodCategoryMap.set(
      category,
      (periodCategoryMap.get(category) || 0) + record.quantity
    );
  });

  // Get all unique categories
  const allCategories = new Set<string>();
  categoryMap.forEach((periodCategoryMap) => {
    periodCategoryMap.forEach((_, category) => allCategories.add(category));
  });

  // Convert to array format
  const result: CategorySales[] = [];
  const sortedDates = Array.from(categoryMap.keys()).sort();

  sortedDates.forEach((date) => {
    const periodCategoryMap = categoryMap.get(date)!;
    const entry: CategorySales = { date };

    allCategories.forEach((category) => {
      entry[category] = periodCategoryMap.get(category) || 0;
    });

    result.push(entry);
  });

  return result;
}

// Employee Performance with Product Breakdown
export function getEmployeePerformance(
  salesData: SalesRecord[],
  topN?: number // Optional limit, if not provided returns all employees
): EmployeePerformance[] {
  // Get all employees by revenue
  const employeeMap = new Map<
    string,
    {
      staffCode: string;
      totalRevenue: number;
      products: Map<string, number>;
      stores: Set<string>;
    }
  >();

  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;
    if (!sale.staffName || !sale.staffCode) return;

    const staffKey = `${sale.staffCode}-${sale.staffName}`;
    if (!employeeMap.has(staffKey)) {
      employeeMap.set(staffKey, {
        staffCode: sale.staffCode,
        totalRevenue: 0,
        products: new Map(),
        stores: new Set(),
      });
    }

    const employeeData = employeeMap.get(staffKey)!;
    employeeData.totalRevenue += sale.amount;

    // Track store
    if (sale.storeName && sale.storeName.trim()) {
      employeeData.stores.add(sale.storeName.trim());
    }

    const productName = sale.productName || sale.productCode || "Unknown";
    employeeData.products.set(
      productName,
      (employeeData.products.get(productName) || 0) + sale.amount
    );
  });

  const result: EmployeePerformance[] = Array.from(employeeMap.entries())
    .map(([staffKey, data]) => ({
      staffName: staffKey.split("-").slice(1).join("-"), // Get name part after code
      staffCode: data.staffCode,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores).sort(),
      products: Array.from(data.products.entries())
        .map(([productName, revenue]) => ({ productName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Only apply limit if topN is provided
  return topN !== undefined ? result.slice(0, topN) : result;
}

export type Granularity = "daily" | "3day" | "weekly" | "monthly" | "quarterly";

export function getDateKey(date: Date, granularity: Granularity): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (granularity) {
    case "daily":
      return `${year}-${month}-${day}`;

    case "3day": {
      // Group into rolling 3-day periods starting from year beginning
      const startOfYear = new Date(year, 0, 1);
      const daysDiff = Math.floor(
        (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
      );
      const period = Math.floor(daysDiff / 3);
      const periodStartDate = new Date(startOfYear);
      periodStartDate.setDate(periodStartDate.getDate() + period * 3);
      const periodEndDate = new Date(periodStartDate);
      periodEndDate.setDate(periodEndDate.getDate() + 2);
      return `${String(periodStartDate.getMonth() + 1).padStart(
        2,
        "0"
      )}/${String(periodStartDate.getDate()).padStart(2, "0")} - ${String(
        periodEndDate.getMonth() + 1
      ).padStart(2, "0")}/${String(periodEndDate.getDate()).padStart(2, "0")}`;
    }

    case "weekly": {
      // Get week number (simple week from year start)
      const startOfYear = new Date(year, 0, 1);
      const daysDiff = Math.floor(
        (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
      );
      const week = Math.floor(daysDiff / 7) + 1;
      return `${year}-W${String(week).padStart(2, "0")}`;
    }

    case "monthly":
      return `${year}-${month}`;

    case "quarterly": {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    }

    default:
      return `${year}-${month}-${day}`;
  }
}

export function getTrendsByGranularity(
  salesData: SalesRecord[],
  granularity: Granularity
): TimeSeriesData[] {
  const dataMap = new Map<
    string,
    { revenue: number; transactions: Set<string>; customers: Set<string> }
  >();

  salesData.forEach((record) => {
    const dateStr = record.purchaseDate;
    if (!dateStr) return;

    // Handle date format YYYY-MM-DD
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return;

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);

    const key = getDateKey(date, granularity);

    if (!dataMap.has(key)) {
      dataMap.set(key, {
        revenue: 0,
        transactions: new Set(),
        customers: new Set(),
      });
    }

    const periodData = dataMap.get(key)!;
    periodData.revenue += record.amount;
    periodData.transactions.add(record.transactionNumber);
    periodData.customers.add(record.memberId);
  });

  const result: TimeSeriesData[] = Array.from(dataMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.transactions.size,
      customers: data.customers.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return result;
}

// Keep these for backward compatibility
export function getMonthlyTrends(salesData: SalesRecord[]): TimeSeriesData[] {
  return getTrendsByGranularity(salesData, "monthly");
}

export function getQuarterlyTrends(salesData: SalesRecord[]): TimeSeriesData[] {
  return getTrendsByGranularity(salesData, "quarterly");
}

export function filterSalesData(
  salesData: SalesRecord[],
  filters: {
    startDate?: string;
    endDate?: string;
    categories?: string[];
    stores?: string[];
  }
): SalesRecord[] {
  return salesData.filter((record) => {
    // Date filtering
    if (
      filters.startDate &&
      record.purchaseDate &&
      record.purchaseDate < filters.startDate
    ) {
      return false;
    }
    if (
      filters.endDate &&
      record.purchaseDate &&
      record.purchaseDate > filters.endDate
    ) {
      return false;
    }

    // Category filtering
    if (filters.categories && filters.categories.length > 0) {
      const category = record.itemName || record.productCategoryName || "";
      if (!filters.categories.includes(category)) {
        return false;
      }
    }

    // Store filtering
    if (filters.stores && filters.stores.length > 0) {
      if (!filters.stores.includes(record.storeName)) {
        return false;
      }
    }

    return true;
  });
}

export type BirthdayType = "customer" | "importantPerson";

export function getBirthdaySalesCorrelation(
  salesData: SalesRecord[],
  memberData: MemberRecord[],
  daysRange: number = 30,
  birthdayType: BirthdayType = "customer"
): BirthdaySalesData[] {
  // Create a map of memberId to birthDate (customer's own birthday or important person's birthday)
  const memberBirthdayMap = new Map<string, string>();
  memberData.forEach((member) => {
    if (member.memberId) {
      const birthdayStr =
        birthdayType === "customer"
          ? member.birthDate
          : member.importantPersonBirthday;
      if (birthdayStr) {
        memberBirthdayMap.set(member.memberId, birthdayStr);
      }
    }
  });

  // Initialize buckets for each day from -daysRange to +daysRange
  const buckets = new Map<
    number,
    { salesCount: number; revenue: number; transactions: Set<string> }
  >();
  for (let i = -daysRange; i <= daysRange; i++) {
    buckets.set(i, { salesCount: 0, revenue: 0, transactions: new Set() });
  }

  salesData.forEach((sale) => {
    const memberId = sale.memberId;
    const birthDateStr = memberBirthdayMap.get(memberId);
    if (!birthDateStr || !sale.purchaseDate) return;

    // Parse dates
    const birthDateMatch = birthDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const purchaseDateMatch = sale.purchaseDate.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );
    if (!birthDateMatch || !purchaseDateMatch) return;

    const birthDate = new Date(
      parseInt(birthDateMatch[1]),
      parseInt(birthDateMatch[2]) - 1,
      parseInt(birthDateMatch[3])
    );
    const purchaseDate = new Date(
      parseInt(purchaseDateMatch[1]),
      parseInt(purchaseDateMatch[2]) - 1,
      parseInt(purchaseDateMatch[3])
    );

    // Calculate days from birthday - check current year, previous year, and next year
    // to find the closest birthday
    const currentYear = purchaseDate.getFullYear();
    const thisYearBirthday = new Date(
      currentYear,
      birthDate.getMonth(),
      birthDate.getDate()
    );
    const prevYearBirthday = new Date(
      currentYear - 1,
      birthDate.getMonth(),
      birthDate.getDate()
    );
    const nextYearBirthday = new Date(
      currentYear + 1,
      birthDate.getMonth(),
      birthDate.getDate()
    );

    const daysDiffThis = Math.floor(
      (purchaseDate.getTime() - thisYearBirthday.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysDiffPrev = Math.floor(
      (purchaseDate.getTime() - prevYearBirthday.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysDiffNext = Math.floor(
      (purchaseDate.getTime() - nextYearBirthday.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Find the closest birthday
    let daysDiff = daysDiffThis;
    if (Math.abs(daysDiffPrev) < Math.abs(daysDiff)) {
      daysDiff = daysDiffPrev;
    }
    if (Math.abs(daysDiffNext) < Math.abs(daysDiff)) {
      daysDiff = daysDiffNext;
    }

    // Only include if within range
    if (daysDiff >= -daysRange && daysDiff <= daysRange) {
      const bucket = buckets.get(daysDiff);
      if (bucket) {
        bucket.salesCount += sale.quantity;
        bucket.revenue += sale.amount;
        bucket.transactions.add(sale.transactionNumber);
      }
    }
  });

  // Convert to array format
  const result: BirthdaySalesData[] = Array.from(buckets.entries())
    .map(([daysFromBirthday, data]) => ({
      daysFromBirthday,
      salesCount: data.salesCount,
      revenue: data.revenue,
      transactions: data.transactions.size,
    }))
    .sort((a, b) => a.daysFromBirthday - b.daysFromBirthday);

  return result;
}

// 1. Product Performance Analysis
export function getTopProducts(
  salesData: SalesRecord[],
  limit: number = 20
): ProductPerformance[] {
  const productMap = new Map<
    string,
    {
      revenue: number;
      quantity: number;
      transactions: Set<string>;
      productCode: string;
    }
  >();

  salesData.forEach((sale) => {
    const key = sale.productName || sale.productCode;
    // Only count actual sales with positive amounts
    if (!key || sale.transactionType !== "売上" || sale.amount <= 0) return;

    if (!productMap.has(key)) {
      productMap.set(key, {
        revenue: 0,
        quantity: 0,
        transactions: new Set(),
        productCode: sale.productCode,
      });
    }

    const product = productMap.get(key)!;
    product.revenue += sale.amount;
    product.quantity += sale.quantity;
    product.transactions.add(sale.transactionNumber);
  });

  const result: ProductPerformance[] = Array.from(productMap.entries())
    .map(([productName, data]) => ({
      productName,
      productCode: data.productCode,
      revenue: data.revenue,
      quantity: data.quantity,
      transactions: data.transactions.size,
      averagePrice: data.quantity > 0 ? data.revenue / data.quantity : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return result;
}

// 2. Store Performance Analysis
export function getStorePerformance(
  salesData: SalesRecord[]
): StorePerformance[] {
  const storeMap = new Map<
    string,
    {
      revenue: number;
      transactions: Set<string>;
      customers: Set<string>;
      storeCode: string;
    }
  >();

  salesData.forEach((sale) => {
    // Only count actual sales transactions (not cancellations/refunds)
    // Also ensure amount is positive (some sales might have negative amounts due to refunds)
    if (
      !sale.storeName ||
      sale.storeName.trim() === "" ||
      sale.transactionType !== "売上" ||
      sale.amount <= 0
    )
      return;

    // Normalize store name (trim whitespace) to handle variations
    const normalizedStoreName = sale.storeName.trim();

    if (!storeMap.has(normalizedStoreName)) {
      storeMap.set(normalizedStoreName, {
        revenue: 0,
        transactions: new Set(),
        customers: new Set(),
        storeCode: sale.storeCode,
      });
    }

    const store = storeMap.get(normalizedStoreName)!;
    store.revenue += sale.amount;
    store.transactions.add(sale.transactionNumber);
    store.customers.add(sale.memberId);
  });

  const result: StorePerformance[] = Array.from(storeMap.entries())
    .map(([storeName, data]) => ({
      storeName,
      storeCode: data.storeCode,
      revenue: data.revenue,
      transactions: data.transactions.size,
      customers: data.customers.size,
      averageOrderValue:
        data.transactions.size > 0 ? data.revenue / data.transactions.size : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return result;
}

// 3. Color/Material Trends
export function getAttributeTrends(
  salesData: SalesRecord[],
  attribute: "color" | "material",
  granularity: Granularity = "monthly"
): AttributeTrend[] {
  const attributeMap = new Map<string, Map<string, number>>();

  salesData.forEach((record) => {
    const dateStr = record.purchaseDate;
    if (!dateStr) return;

    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return;

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);

    const periodKey = getDateKey(date, granularity);
    const attrValue =
      attribute === "color"
        ? record.colorName || "その他"
        : record.materialName || "その他";

    if (!attributeMap.has(periodKey)) {
      attributeMap.set(periodKey, new Map());
    }

    const periodMap = attributeMap.get(periodKey)!;
    periodMap.set(attrValue, (periodMap.get(attrValue) || 0) + record.quantity);
  });

  const allAttributes = new Set<string>();
  attributeMap.forEach((periodMap) => {
    periodMap.forEach((_, attr) => allAttributes.add(attr));
  });

  const result: AttributeTrend[] = Array.from(attributeMap.entries())
    .map(([date, periodMap]) => {
      const entry: AttributeTrend = { date };
      allAttributes.forEach((attr) => {
        entry[attr] = periodMap.get(attr) || 0;
      });
      return entry;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return result;
}

// 4. Customer Segmentation
export function getCustomerSegments(
  salesData: SalesRecord[]
): CustomerSegment[] {
  const customerMap = new Map<string, number>();

  salesData.forEach((sale) => {
    // Only count actual sales with positive amounts
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;
    const current = customerMap.get(sale.memberId) || 0;
    customerMap.set(sale.memberId, current + sale.amount);
  });

  const totalCustomers = customerMap.size;

  const segments: CustomerSegment[] = [
    {
      segment: "VIP (>¥100,000)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "High Value (¥50,000-100,000)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Regular (¥20,000-50,000)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Occasional (<¥20,000)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
  ];

  customerMap.forEach((revenue) => {
    if (revenue >= 100000) {
      segments[0].count++;
      segments[0].totalRevenue += revenue;
    } else if (revenue >= 50000) {
      segments[1].count++;
      segments[1].totalRevenue += revenue;
    } else if (revenue >= 20000) {
      segments[2].count++;
      segments[2].totalRevenue += revenue;
    } else {
      segments[3].count++;
      segments[3].totalRevenue += revenue;
    }
  });

  segments.forEach((segment) => {
    segment.averageRevenue =
      segment.count > 0 ? segment.totalRevenue / segment.count : 0;
    segment.percentage =
      totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
  });

  return segments;
}

// 5. Day of Week Analysis
export function getDayOfWeekAnalysis(
  salesData: SalesRecord[]
): DayOfWeekData[] {
  const dayMap = new Map<
    number,
    { revenue: number; transactions: Set<string>; customers: Set<string> }
  >();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  salesData.forEach((sale) => {
    // Only count actual sales with positive amounts
    if (
      !sale.purchaseDate ||
      sale.transactionType !== "売上" ||
      sale.amount <= 0
    )
      return;

    const dateMatch = sale.purchaseDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return;

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    if (!dayMap.has(dayOfWeek)) {
      dayMap.set(dayOfWeek, {
        revenue: 0,
        transactions: new Set(),
        customers: new Set(),
      });
    }

    const dayData = dayMap.get(dayOfWeek)!;
    dayData.revenue += sale.amount;
    dayData.transactions.add(sale.transactionNumber);
    dayData.customers.add(sale.memberId);
  });

  const result: DayOfWeekData[] = Array.from(dayMap.entries())
    .map(([dayNum, data]) => ({
      day: dayNames[dayNum],
      revenue: data.revenue,
      transactions: data.transactions.size,
      customers: data.customers.size,
    }))
    .sort((a, b) => {
      const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return order.indexOf(a.day) - order.indexOf(b.day);
    });

  return result;
}

// Advanced Customer Segmentation Functions

// Get detailed customer data
export function getCustomerDetails(
  salesData: SalesRecord[]
): Map<string, CustomerDetail> {
  const customerMap = new Map<string, CustomerDetail>();
  const now = new Date();

  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    const memberId = sale.memberId;
    if (!customerMap.has(memberId)) {
      customerMap.set(memberId, {
        memberId,
        totalRevenue: 0,
        transactionCount: 0,
        averageOrderValue: 0,
        firstPurchaseDate: sale.purchaseDate,
        lastPurchaseDate: sale.purchaseDate,
        daysSinceLastPurchase: 0,
        preferredStore: sale.storeName,
        preferredCategory: sale.itemName || sale.productCategoryName || "",
        isOnlineCustomer: false,
      });
    }

    const customer = customerMap.get(memberId)!;
    customer.totalRevenue += sale.amount;
    customer.transactionCount += 1;

    // Update dates
    if (sale.purchaseDate < customer.firstPurchaseDate) {
      customer.firstPurchaseDate = sale.purchaseDate;
    }
    if (sale.purchaseDate > customer.lastPurchaseDate) {
      customer.lastPurchaseDate = sale.purchaseDate;
    }

    // Check if online customer
    if (sale.storeName && sale.storeName.toLowerCase().includes("online")) {
      customer.isOnlineCustomer = true;
    }
  });

  // Calculate final metrics
  customerMap.forEach((customer) => {
    customer.averageOrderValue =
      customer.transactionCount > 0
        ? customer.totalRevenue / customer.transactionCount
        : 0;

    // Calculate days since last purchase
    const lastDateMatch = customer.lastPurchaseDate.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );
    if (lastDateMatch) {
      const lastDate = new Date(
        parseInt(lastDateMatch[1]),
        parseInt(lastDateMatch[2]) - 1,
        parseInt(lastDateMatch[3])
      );
      customer.daysSinceLastPurchase = Math.floor(
        (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
  });

  return customerMap;
}

// RFM Segmentation (Recency, Frequency, Monetary)
export function getRFMSegments(salesData: SalesRecord[]): RFMSegment[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());

  if (customers.length === 0) return [];

  // Calculate quartiles for R, F, M using percentile-based approach
  const recencies = customers
    .map((c) => c.daysSinceLastPurchase)
    .sort((a, b) => a - b);
  const frequencies = customers
    .map((c) => c.transactionCount)
    .sort((a, b) => a - b);
  const monetaries = customers.map((c) => c.totalRevenue).sort((a, b) => a - b);

  // Use percentile indices to get thresholds for M score
  const getPercentileValue = (
    sortedArray: number[],
    percentile: number
  ): number => {
    if (sortedArray.length === 0) return 0;
    const index = Math.floor(sortedArray.length * percentile);
    return sortedArray[Math.min(index, sortedArray.length - 1)];
  };

  const m25 = getPercentileValue(monetaries, 0.25);
  const m50 = getPercentileValue(monetaries, 0.5);
  const m75 = getPercentileValue(monetaries, 0.75);

  const segmentMap = new Map<
    string,
    {
      count: number;
      revenue: number;
      description: string;
      rScore: number;
      fScore: number;
      mScore: number;
    }
  >();

  // Create maps for quick lookup of customer position in sorted arrays
  const recencyMap = new Map<number, number[]>();
  recencies.forEach((recency, index) => {
    if (!recencyMap.has(recency)) {
      recencyMap.set(recency, []);
    }
    recencyMap.get(recency)!.push(index);
  });

  const frequencyMap = new Map<number, number[]>();
  frequencies.forEach((freq, index) => {
    if (!frequencyMap.has(freq)) {
      frequencyMap.set(freq, []);
    }
    frequencyMap.get(freq)!.push(index);
  });

  customers.forEach((customer) => {
    // Score R (Recency - lower is better, so invert)
    // Use percentile-based assignment for better distribution
    const customerRecency = customer.daysSinceLastPurchase;
    const recencyIndices = recencyMap.get(customerRecency) || [];
    const avgRecencyIndex =
      recencyIndices.length > 0
        ? recencyIndices.reduce((sum, idx) => sum + idx, 0) /
          recencyIndices.length
        : recencies.length / 2;
    const recencyPercentile = avgRecencyIndex / recencies.length;

    let rScore: number;
    if (recencyPercentile <= 0.25) {
      rScore = 4;
    } else if (recencyPercentile <= 0.5) {
      rScore = 3;
    } else if (recencyPercentile <= 0.75) {
      rScore = 2;
    } else {
      rScore = 1;
    }

    // Score F (Frequency - higher is better)
    const customerFreq = customer.transactionCount;
    const freqIndices = frequencyMap.get(customerFreq) || [];
    const avgFreqIndex =
      freqIndices.length > 0
        ? freqIndices.reduce((sum, idx) => sum + idx, 0) / freqIndices.length
        : frequencies.length / 2;
    const freqPercentile = avgFreqIndex / frequencies.length;

    let fScore: number;
    if (freqPercentile >= 0.75) {
      fScore = 4;
    } else if (freqPercentile >= 0.5) {
      fScore = 3;
    } else if (freqPercentile >= 0.25) {
      fScore = 2;
    } else {
      fScore = 1;
    }

    // Score M (Monetary)
    const mScore =
      customer.totalRevenue >= m75
        ? 4
        : customer.totalRevenue >= m50
        ? 3
        : customer.totalRevenue >= m25
        ? 2
        : 1;

    // Assign segment based on RFM score
    let segment = "";
    let description = "";

    if (rScore >= 3 && fScore >= 3 && mScore >= 3) {
      segment = "Champions";
      description =
        "Your best customers! Purchased recently, buy frequently, and spend high amounts. They are brand advocates and likely to respond to new product launches, VIP programs, and referral incentives.";
    } else if (rScore >= 3 && fScore <= 2 && mScore >= 3) {
      segment = "Potential Loyalists";
      description =
        "High-value customers who purchase recently but not frequently. Great candidates for subscription programs, bundling offers, or personalized recommendations to increase purchase frequency.";
    } else if (rScore >= 2 && fScore >= 3 && mScore <= 2) {
      segment = "Loyal Customers";
      description =
        "Regular, frequent buyers who are loyal to your brand but spend less per transaction. Focus on upselling premium products, creating bundles, or introducing higher-value items to increase average order value.";
    } else if (rScore >= 3 && fScore <= 2 && mScore <= 2) {
      segment = "New Customers";
      description =
        "Recently acquired customers with only 1-2 purchases. Critical stage - engage with welcome series, onboarding content, and special offers to encourage second purchase and build loyalty.";
    } else if (rScore <= 2 && fScore >= 3 && mScore >= 3) {
      segment = "At Risk";
      description =
        "Previously valuable, frequent customers who haven't purchased recently. URGENT: Send win-back campaigns, personalized offers, and surveys to understand why they stopped buying. High priority for retention efforts.";
    } else if (rScore <= 2 && fScore >= 2 && mScore >= 2) {
      segment = "Cannot Lose Them";
      description =
        "Good customers who were active but haven't purchased recently. Send re-engagement campaigns, showcase new products, offer special discounts, and remind them what they're missing.";
    } else if (rScore <= 1 && fScore >= 2) {
      segment = "About to Sleep";
      description =
        "Customers who haven't purchased in a very long time but were previously engaged. Last chance to reactivate - consider deep discounts, clearance offers, or survey to understand barriers before they become lost.";
    } else if (rScore <= 2 && fScore <= 2 && mScore <= 2) {
      segment = "Lost";
      description =
        "Low-value customers who haven't purchased recently and never purchased frequently. Low priority - may not be worth aggressive reactivation efforts. Focus resources on higher-value segments.";
    } else {
      segment = "Hibernating";
      description =
        "Completely inactive customers who purchased long ago. Very difficult to reactivate. Consider removing from active marketing lists unless testing deep discount reactivation campaigns.";
    }

    if (!segmentMap.has(segment)) {
      segmentMap.set(segment, {
        count: 0,
        revenue: 0,
        description,
        rScore: 0,
        fScore: 0,
        mScore: 0,
      });
    }
    const seg = segmentMap.get(segment)!;
    seg.count++;
    seg.revenue += customer.totalRevenue;
    // Update scores to be the average for the segment
    seg.rScore = (seg.rScore * (seg.count - 1) + rScore) / seg.count;
    seg.fScore = (seg.fScore * (seg.count - 1) + fScore) / seg.count;
    seg.mScore = (seg.mScore * (seg.count - 1) + mScore) / seg.count;
  });

  const totalCustomers = customers.length;
  const result: RFMSegment[] = Array.from(segmentMap.entries())
    .map(([segment, data]) => ({
      segment,
      description: data.description,
      count: data.count,
      totalRevenue: data.revenue,
      averageRevenue: data.count > 0 ? data.revenue / data.count : 0,
      percentage: (data.count / totalCustomers) * 100,
      rScore: Math.round(data.rScore * 10) / 10, // Round to 1 decimal
      fScore: Math.round(data.fScore * 10) / 10,
      mScore: Math.round(data.mScore * 10) / 10,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return result;
}

// RFM Matrix - Distribute customers across all R-F buckets
export function getRFMMatrix(salesData: SalesRecord[]): RFMMatrixCell[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());

  if (customers.length === 0) return [];

  // Calculate quartiles for M score
  const monetaries = customers.map((c) => c.totalRevenue).sort((a, b) => a - b);

  // Use percentile indices to get thresholds for M score
  const getPercentileValue = (
    sortedArray: number[],
    percentile: number
  ): number => {
    if (sortedArray.length === 0) return 0;
    const index = Math.floor(sortedArray.length * percentile);
    return sortedArray[Math.min(index, sortedArray.length - 1)];
  };

  const m25 = getPercentileValue(monetaries, 0.25);
  const m50 = getPercentileValue(monetaries, 0.5);
  const m75 = getPercentileValue(monetaries, 0.75);

  // Initialize matrix cells for all 16 combinations (4x4)
  const matrixMap = new Map<
    string,
    {
      count: number;
      revenue: number;
      mScoreSum: number;
      segments: Set<string>;
    }
  >();

  // Initialize all 16 cells
  for (let r = 1; r <= 4; r++) {
    for (let f = 1; f <= 4; f++) {
      const key = `${r}-${f}`;
      matrixMap.set(key, {
        count: 0,
        revenue: 0,
        mScoreSum: 0,
        segments: new Set(),
      });
    }
  }

  // Also get named segments for reference
  const rfmSegments = getRFMSegments(salesData);
  const segmentMap = new Map<string, RFMSegment[]>();
  rfmSegments.forEach((segment) => {
    const r = Math.round(segment.rScore);
    const f = Math.round(segment.fScore);
    const key = `${r}-${f}`;
    if (!segmentMap.has(key)) {
      segmentMap.set(key, []);
    }
    segmentMap.get(key)!.push(segment);
  });

  // Create customer-to-index maps for sequential assignment
  // Sort customers by recency and frequency, then assign sequentially to ensure even distribution
  const customersByRecency = [...customers].sort(
    (a, b) => a.daysSinceLastPurchase - b.daysSinceLastPurchase
  );
  const customersByFrequency = [...customers].sort(
    (a, b) => b.transactionCount - a.transactionCount // Descending for frequency (higher is better)
  );

  const customerToRecencyIndex = new Map<string, number>();
  const customerToFrequencyIndex = new Map<string, number>();

  customersByRecency.forEach((customer, index) => {
    customerToRecencyIndex.set(customer.memberId, index);
  });

  customersByFrequency.forEach((customer, index) => {
    customerToFrequencyIndex.set(customer.memberId, index);
  });

  // Process each customer and assign to R-F bucket
  // Use sequential assignment to ensure each quartile gets ~25% of customers
  const quartileSize = Math.ceil(customers.length / 4);

  customers.forEach((customer) => {
    // Score R (Recency - lower is better, so first 25% get score 4)
    const recencyIndex = customerToRecencyIndex.get(customer.memberId) ?? 0;

    let rScore: number;
    if (recencyIndex < quartileSize) {
      rScore = 4;
    } else if (recencyIndex < quartileSize * 2) {
      rScore = 3;
    } else if (recencyIndex < quartileSize * 3) {
      rScore = 2;
    } else {
      rScore = 1;
    }

    // Score F (Frequency - higher is better, so first 25% get score 4)
    const freqIndex = customerToFrequencyIndex.get(customer.memberId) ?? 0;

    let fScore: number;
    if (freqIndex < quartileSize) {
      fScore = 4;
    } else if (freqIndex < quartileSize * 2) {
      fScore = 3;
    } else if (freqIndex < quartileSize * 3) {
      fScore = 2;
    } else {
      fScore = 1;
    }

    // Score M (Monetary)
    const mScore =
      customer.totalRevenue >= m75
        ? 4
        : customer.totalRevenue >= m50
        ? 3
        : customer.totalRevenue >= m25
        ? 2
        : 1;

    const key = `${rScore}-${fScore}`;
    const cell = matrixMap.get(key)!;
    cell.count++;
    cell.revenue += customer.totalRevenue;
    cell.mScoreSum += mScore;

    // Add segment name if this customer matches a named segment
    // We'll match based on the segment's R-F range
    rfmSegments.forEach((segment) => {
      const segR = Math.round(segment.rScore);
      const segF = Math.round(segment.fScore);
      if (segR === rScore && segF === fScore) {
        cell.segments.add(segment.segment);
      }
    });
  });

  // Calculate ranges for each R and F bucket
  // Note: Score 4 = best (first quartile), Score 1 = worst (last quartile)
  const recencyRanges: { [key: number]: { min: number; max: number } } = {};
  const frequencyRanges: { [key: number]: { min: number; max: number } } = {};

  for (let score = 1; score <= 4; score++) {
    // Reverse the mapping: score 4 = first quartile, score 1 = last quartile
    const quartileNumber = 5 - score; // 4->1, 3->2, 2->3, 1->4
    const startIdx = (quartileNumber - 1) * quartileSize;
    const endIdx =
      quartileNumber === 4 ? customers.length : quartileNumber * quartileSize;

    // Recency ranges (ascending order - lower days = better, so score 4 gets first quartile)
    if (startIdx < customersByRecency.length) {
      const recencySlice = customersByRecency.slice(startIdx, endIdx);
      if (recencySlice.length > 0) {
        recencyRanges[score] = {
          min: recencySlice[0].daysSinceLastPurchase,
          max: recencySlice[recencySlice.length - 1].daysSinceLastPurchase,
        };
      }
    }

    // Frequency ranges (descending order - higher transactions = better, so score 4 gets first quartile)
    if (startIdx < customersByFrequency.length) {
      const freqSlice = customersByFrequency.slice(startIdx, endIdx);
      if (freqSlice.length > 0) {
        frequencyRanges[score] = {
          min: freqSlice[freqSlice.length - 1].transactionCount,
          max: freqSlice[0].transactionCount,
        };
      }
    }
  }

  // Convert to array format
  const result: RFMMatrixCell[] = [];
  for (let r = 1; r <= 4; r++) {
    for (let f = 1; f <= 4; f++) {
      const key = `${r}-${f}`;
      const cell = matrixMap.get(key)!;
      const segments = Array.from(cell.segments)
        .map((segName) => rfmSegments.find((s) => s.segment === segName))
        .filter((s): s is RFMSegment => s !== undefined);

      result.push({
        rScore: r,
        fScore: f,
        count: cell.count,
        totalRevenue: cell.revenue,
        averageRevenue: cell.count > 0 ? cell.revenue / cell.count : 0,
        averageMScore: cell.count > 0 ? cell.mScoreSum / cell.count : 0,
        percentage:
          customers.length > 0 ? (cell.count / customers.length) * 100 : 0,
        segments,
        recencyRange: recencyRanges[r],
        frequencyRange: frequencyRanges[f],
      });
    }
  }

  return result;
}

// Purchase Frequency Segmentation
export function getFrequencySegments(
  salesData: SalesRecord[]
): CustomerSegment[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());

  const segments: CustomerSegment[] = [
    {
      segment: "Very Frequent (10+ purchases)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Frequent (5-9 purchases)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Regular (2-4 purchases)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "One-Time (1 purchase)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
  ];

  // Track transaction counts for AOV calculation
  const segmentTransactionCounts = [0, 0, 0, 0];

  customers.forEach((customer) => {
    if (customer.transactionCount >= 10) {
      segments[0].count++;
      segments[0].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[0] += customer.transactionCount;
    } else if (customer.transactionCount >= 5) {
      segments[1].count++;
      segments[1].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[1] += customer.transactionCount;
    } else if (customer.transactionCount >= 2) {
      segments[2].count++;
      segments[2].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[2] += customer.transactionCount;
    } else {
      segments[3].count++;
      segments[3].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[3] += customer.transactionCount;
    }
  });

  const totalCustomers = customers.length;
  segments.forEach((segment, index) => {
    // AOV = Total Revenue / Total Transactions (per order, not per customer)
    segment.averageRevenue =
      segmentTransactionCounts[index] > 0
        ? segment.totalRevenue / segmentTransactionCounts[index]
        : 0;
    segment.percentage =
      totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
  });

  return segments;
}

// Recency Segmentation
export function getRecencySegments(
  salesData: SalesRecord[]
): CustomerSegment[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());

  const segments: CustomerSegment[] = [
    {
      segment: "Active (0-30 days)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Recent (31-90 days)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "At Risk (91-180 days)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Inactive (180+ days)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
  ];

  // Track transaction counts for AOV calculation
  const segmentTransactionCounts = [0, 0, 0, 0];

  customers.forEach((customer) => {
    if (customer.daysSinceLastPurchase <= 30) {
      segments[0].count++;
      segments[0].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[0] += customer.transactionCount;
    } else if (customer.daysSinceLastPurchase <= 90) {
      segments[1].count++;
      segments[1].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[1] += customer.transactionCount;
    } else if (customer.daysSinceLastPurchase <= 180) {
      segments[2].count++;
      segments[2].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[2] += customer.transactionCount;
    } else {
      segments[3].count++;
      segments[3].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[3] += customer.transactionCount;
    }
  });

  const totalCustomers = customers.length;
  segments.forEach((segment, index) => {
    // AOV = Total Revenue / Total Transactions (per order, not per customer)
    segment.averageRevenue =
      segmentTransactionCounts[index] > 0
        ? segment.totalRevenue / segmentTransactionCounts[index]
        : 0;
    segment.percentage =
      totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
  });

  return segments;
}

// Channel Preference Segmentation
export function getChannelSegments(
  salesData: SalesRecord[]
): CustomerSegment[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());

  const segments: CustomerSegment[] = [
    {
      segment: "Online Only",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Mixed (Online & Store)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Store Only",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
  ];

  // Check each customer's channel usage
  const customerChannelMap = new Map<
    string,
    { online: boolean; store: boolean }
  >();

  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;
    if (!customerChannelMap.has(sale.memberId)) {
      customerChannelMap.set(sale.memberId, { online: false, store: false });
    }
    const channels = customerChannelMap.get(sale.memberId)!;
    if (sale.storeName && sale.storeName.toLowerCase().includes("online")) {
      channels.online = true;
    } else if (sale.storeName && sale.storeName.trim() !== "") {
      channels.store = true;
    }
  });

  // Track transaction counts for AOV calculation
  const segmentTransactionCounts = [0, 0, 0];

  customers.forEach((customer) => {
    const channels = customerChannelMap.get(customer.memberId);
    if (!channels) return;

    if (channels.online && channels.store) {
      segments[1].count++;
      segments[1].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[1] += customer.transactionCount;
    } else if (channels.online) {
      segments[0].count++;
      segments[0].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[0] += customer.transactionCount;
    } else {
      segments[2].count++;
      segments[2].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[2] += customer.transactionCount;
    }
  });

  const totalCustomers = customers.length;
  segments.forEach((segment, index) => {
    // AOV = Total Revenue / Total Transactions (per order, not per customer)
    segment.averageRevenue =
      segmentTransactionCounts[index] > 0
        ? segment.totalRevenue / segmentTransactionCounts[index]
        : 0;
    segment.percentage =
      totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
  });

  return segments;
}

// Average Order Value Segmentation
export function getAOVSegments(salesData: SalesRecord[]): CustomerSegment[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());

  const segments: CustomerSegment[] = [
    {
      segment: "High AOV (>¥15,000)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Medium AOV (¥8,000-15,000)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Low AOV (<¥8,000)",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
  ];

  // Track transaction counts for AOV calculation
  const segmentTransactionCounts = [0, 0, 0];

  customers.forEach((customer) => {
    if (customer.averageOrderValue >= 15000) {
      segments[0].count++;
      segments[0].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[0] += customer.transactionCount;
    } else if (customer.averageOrderValue >= 8000) {
      segments[1].count++;
      segments[1].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[1] += customer.transactionCount;
    } else {
      segments[2].count++;
      segments[2].totalRevenue += customer.totalRevenue;
      segmentTransactionCounts[2] += customer.transactionCount;
    }
  });

  const totalCustomers = customers.length;
  segments.forEach((segment, index) => {
    // AOV = Total Revenue / Total Transactions (per order, not per customer)
    segment.averageRevenue =
      segmentTransactionCounts[index] > 0
        ? segment.totalRevenue / segmentTransactionCounts[index]
        : 0;
    segment.percentage =
      totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
  });

  return segments;
}

// Age Segmentation
export function getAgeSegments(
  salesData: SalesRecord[],
  memberData: MemberRecord[]
): CustomerSegment[] {
  // Create a map of memberId to member info
  const memberMap = new Map<string, MemberRecord>();
  memberData.forEach((member) => {
    if (member.memberId) {
      memberMap.set(member.memberId, member);
    }
  });

  // Calculate customer revenue and transaction counts
  const customerRevenueMap = new Map<string, number>();
  const customerTransactionCountMap = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;
    const current = customerRevenueMap.get(sale.memberId) || 0;
    customerRevenueMap.set(sale.memberId, current + sale.amount);
    const currentCount = customerTransactionCountMap.get(sale.memberId) || 0;
    customerTransactionCountMap.set(sale.memberId, currentCount + 1);
  });

  // Helper function to calculate age from birthDate
  const calculateAge = (birthDateStr: string | null): number | null => {
    if (!birthDateStr) return null;
    // Try to parse different date formats
    const dateMatch = birthDateStr.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
    if (!dateMatch) return null;
    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    const birthDate = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Helper function to get age group
  const getAgeGroup = (age: number | null): string => {
    if (age === null) return "Unknown";
    if (age < 20) return "Under 20";
    if (age < 30) return "20-29";
    if (age < 40) return "30-39";
    if (age < 50) return "40-49";
    if (age < 60) return "50-59";
    if (age < 70) return "60-69";
    return "70+";
  };

  // Initialize segments for age groups
  const ageSegments: CustomerSegment[] = [
    {
      segment: "Under 20",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "20-29",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "30-39",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "40-49",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "50-59",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "60-69",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "70+",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Unknown",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
  ];

  // Track transaction counts per segment for AOV calculation
  const segmentTransactionCounts = new Map<string, number>();
  ageSegments.forEach((seg) => segmentTransactionCounts.set(seg.segment, 0));

  // Process each customer
  customerRevenueMap.forEach((revenue, memberId) => {
    const member = memberMap.get(memberId);
    const transactionCount = customerTransactionCountMap.get(memberId) || 0;

    // Age segmentation
    const age = member ? calculateAge(member.birthDate) : null;
    const ageGroup = getAgeGroup(age);
    const ageSegment = ageSegments.find((s) => s.segment === ageGroup);
    if (ageSegment) {
      ageSegment.count++;
      ageSegment.totalRevenue += revenue;
      segmentTransactionCounts.set(
        ageGroup,
        (segmentTransactionCounts.get(ageGroup) || 0) + transactionCount
      );
    }
  });

  // Calculate averages and percentages
  const totalCustomers = customerRevenueMap.size;

  ageSegments.forEach((segment) => {
    // AOV = Total Revenue / Total Transactions (per order, not per customer)
    const totalTransactions =
      segmentTransactionCounts.get(segment.segment) || 0;
    segment.averageRevenue =
      totalTransactions > 0 ? segment.totalRevenue / totalTransactions : 0;
    segment.percentage =
      totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
  });

  // Filter out segments with 0 count
  return ageSegments.filter((s) => s.count > 0);
}

// Gender Segmentation
export function getGenderSegments(
  salesData: SalesRecord[],
  memberData: MemberRecord[]
): CustomerSegment[] {
  // Create a map of memberId to member info
  const memberMap = new Map<string, MemberRecord>();
  memberData.forEach((member) => {
    if (member.memberId) {
      memberMap.set(member.memberId, member);
    }
  });

  // Calculate customer revenue and transaction counts
  const customerRevenueMap = new Map<string, number>();
  const customerTransactionCountMap = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;
    const current = customerRevenueMap.get(sale.memberId) || 0;
    customerRevenueMap.set(sale.memberId, current + sale.amount);
    const currentCount = customerTransactionCountMap.get(sale.memberId) || 0;
    customerTransactionCountMap.set(sale.memberId, currentCount + 1);
  });

  // Initialize segments for gender
  const genderSegments: CustomerSegment[] = [
    {
      segment: "Male",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Female",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Other",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Unknown",
      count: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      percentage: 0,
    },
  ];

  // Track transaction counts per segment for AOV calculation
  const segmentTransactionCounts = new Map<string, number>();
  genderSegments.forEach((seg) => segmentTransactionCounts.set(seg.segment, 0));

  // Process each customer
  customerRevenueMap.forEach((revenue, memberId) => {
    const member = memberMap.get(memberId);
    const transactionCount = customerTransactionCountMap.get(memberId) || 0;

    // Gender segmentation
    const gender = member?.gender?.trim() || "";
    let genderSegment: CustomerSegment | undefined;

    // Handle numeric encoding: 1 = Male, 2 = Female
    if (
      gender === "1" ||
      gender === "男性" ||
      gender.toLowerCase() === "male" ||
      gender === "M"
    ) {
      genderSegment = genderSegments.find((s) => s.segment === "Male");
    } else if (
      gender === "2" ||
      gender === "女性" ||
      gender.toLowerCase() === "female" ||
      gender === "F"
    ) {
      genderSegment = genderSegments.find((s) => s.segment === "Female");
    } else if (
      gender &&
      gender !== "Unknown" &&
      gender !== "" &&
      gender !== "1" &&
      gender !== "2"
    ) {
      genderSegment = genderSegments.find((s) => s.segment === "Other");
    } else {
      genderSegment = genderSegments.find((s) => s.segment === "Unknown");
    }
    if (genderSegment) {
      genderSegment.count++;
      genderSegment.totalRevenue += revenue;
      segmentTransactionCounts.set(
        genderSegment.segment,
        (segmentTransactionCounts.get(genderSegment.segment) || 0) +
          transactionCount
      );
    }
  });

  // Calculate averages and percentages
  const totalCustomers = customerRevenueMap.size;

  genderSegments.forEach((segment) => {
    // AOV = Total Revenue / Total Transactions (per order, not per customer)
    const totalTransactions =
      segmentTransactionCounts.get(segment.segment) || 0;
    segment.averageRevenue =
      totalTransactions > 0 ? segment.totalRevenue / totalTransactions : 0;
    segment.percentage =
      totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
  });

  // Filter out segments with 0 count
  return genderSegments.filter((s) => s.count > 0);
}

// Product Trends Over Time
export function getProductTrends(
  salesData: SalesRecord[],
  topN: number = 10,
  granularity: Granularity = "monthly"
): ProductTrend[] {
  // First get top products
  const topProducts = getTopProducts(salesData, topN);
  const topProductNames = new Set(topProducts.map((p) => p.productName));

  // Group by period and product
  const trendMap = new Map<string, Map<string, number>>();

  salesData.forEach((record) => {
    const productName = record.productName || record.productCode;
    if (!productName || !topProductNames.has(productName)) return;
    if (record.transactionType !== "売上" || record.amount <= 0) return;

    const dateStr = record.purchaseDate;
    if (!dateStr) return;

    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return;

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);
    const periodKey = getDateKey(date, granularity);

    if (!trendMap.has(periodKey)) {
      trendMap.set(periodKey, new Map());
    }

    const periodMap = trendMap.get(periodKey)!;
    periodMap.set(
      productName,
      (periodMap.get(productName) || 0) + record.amount
    );
  });

  // Convert to array format
  const result: ProductTrend[] = [];
  const sortedDates = Array.from(trendMap.keys()).sort();

  sortedDates.forEach((date) => {
    const periodMap = trendMap.get(date)!;
    const entry: ProductTrend = { date };

    topProductNames.forEach((productName) => {
      entry[productName] = periodMap.get(productName) || 0;
    });

    result.push(entry);
  });

  return result;
}

// Brand/Collection Performance
export function getBrandCollectionPerformance(
  salesData: SalesRecord[],
  type: "brand" | "collection"
): BrandCollectionPerformance[] {
  const performanceMap = new Map<
    string,
    {
      revenue: number;
      quantity: number;
      transactions: Set<string>;
      products: Set<string>;
    }
  >();

  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    const key =
      type === "brand"
        ? sale.brand || "その他"
        : sale.collectionName || "その他";

    if (!performanceMap.has(key)) {
      performanceMap.set(key, {
        revenue: 0,
        quantity: 0,
        transactions: new Set(),
        products: new Set(),
      });
    }

    const perf = performanceMap.get(key)!;
    perf.revenue += sale.amount;
    perf.quantity += sale.quantity;
    perf.transactions.add(sale.transactionNumber);
    perf.products.add(sale.productName || sale.productCode);
  });

  const result: BrandCollectionPerformance[] = Array.from(
    performanceMap.entries()
  )
    .map(([name, data]) => ({
      name,
      type,
      revenue: data.revenue,
      quantity: data.quantity,
      transactions: data.transactions.size,
      averagePrice: data.quantity > 0 ? data.revenue / data.quantity : 0,
      productCount: data.products.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return result;
}

// Product by Store Performance
export function getProductStorePerformance(
  salesData: SalesRecord[],
  topNProducts: number = 20
): ProductStorePerformance[] {
  // First get top products
  const topProducts = getTopProducts(salesData, topNProducts);
  const topProductNames = new Set(topProducts.map((p) => p.productName));

  const performanceMap = new Map<
    string,
    {
      productName: string;
      productCode: string;
      storeName: string;
      storeCode: string;
      revenue: number;
      quantity: number;
      transactions: Set<string>;
    }
  >();

  salesData.forEach((sale) => {
    const productName = sale.productName || sale.productCode;
    if (!productName || !topProductNames.has(productName)) return;
    if (!sale.storeName || sale.storeName.trim() === "") return;
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    const key = `${productName}|${sale.storeName.trim()}`;

    if (!performanceMap.has(key)) {
      performanceMap.set(key, {
        productName,
        productCode: sale.productCode,
        storeName: sale.storeName.trim(),
        storeCode: sale.storeCode,
        revenue: 0,
        quantity: 0,
        transactions: new Set(),
      });
    }

    const perf = performanceMap.get(key)!;
    perf.revenue += sale.amount;
    perf.quantity += sale.quantity;
    perf.transactions.add(sale.transactionNumber);
  });

  const result: ProductStorePerformance[] = Array.from(performanceMap.values())
    .map((data) => ({
      productName: data.productName,
      productCode: data.productCode,
      storeName: data.storeName,
      storeCode: data.storeCode,
      revenue: data.revenue,
      quantity: data.quantity,
      transactions: data.transactions.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return result;
}

// Product Performance with Store Breakdown
export function getProductPerformanceWithStores(
  salesData: SalesRecord[],
  topN: number = 10
): PerformanceWithStoreBreakdown[] {
  // Get top products
  const topProducts = getTopProducts(salesData, topN);
  const topProductNames = new Set(topProducts.map((p) => p.productName));

  // Map: productName -> Map: storeName -> revenue
  const productStoreMap = new Map<
    string,
    {
      totalRevenue: number;
      stores: Map<string, number>;
    }
  >();

  salesData.forEach((sale) => {
    const productName = sale.productName || sale.productCode;
    if (!productName || !topProductNames.has(productName)) return;
    if (!sale.storeName || sale.storeName.trim() === "") return;
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    const storeName = sale.storeName.trim();

    if (!productStoreMap.has(productName)) {
      productStoreMap.set(productName, {
        totalRevenue: 0,
        stores: new Map(),
      });
    }

    const productData = productStoreMap.get(productName)!;
    productData.totalRevenue += sale.amount;
    productData.stores.set(
      storeName,
      (productData.stores.get(storeName) || 0) + sale.amount
    );
  });

  const result: PerformanceWithStoreBreakdown[] = Array.from(
    productStoreMap.entries()
  )
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([storeName, revenue]) => ({ storeName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return result;
}

// Collection Performance with Store Breakdown
export function getCollectionPerformanceWithStores(
  salesData: SalesRecord[],
  topN: number = 10
): PerformanceWithStoreBreakdown[] {
  // Get top collections
  const topCollections = getBrandCollectionPerformance(salesData, "collection");
  const topCollectionNames = new Set(
    topCollections.slice(0, topN).map((c) => c.name)
  );

  // Map: collectionName -> Map: storeName -> revenue
  const collectionStoreMap = new Map<
    string,
    {
      totalRevenue: number;
      stores: Map<string, number>;
    }
  >();

  salesData.forEach((sale) => {
    const collectionName = sale.collectionName || "その他";
    if (!topCollectionNames.has(collectionName)) return;
    if (!sale.storeName || sale.storeName.trim() === "") return;
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    const storeName = sale.storeName.trim();

    if (!collectionStoreMap.has(collectionName)) {
      collectionStoreMap.set(collectionName, {
        totalRevenue: 0,
        stores: new Map(),
      });
    }

    const collectionData = collectionStoreMap.get(collectionName)!;
    collectionData.totalRevenue += sale.amount;
    collectionData.stores.set(
      storeName,
      (collectionData.stores.get(storeName) || 0) + sale.amount
    );
  });

  const result: PerformanceWithStoreBreakdown[] = Array.from(
    collectionStoreMap.entries()
  )
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([storeName, revenue]) => ({ storeName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return result;
}

// Color Performance with Store Breakdown
export function getColorPerformanceWithStores(
  salesData: SalesRecord[],
  topN: number = 25
): PerformanceWithStoreBreakdown[] {
  // Map: colorName -> Map: storeName -> revenue
  const colorStoreMap = new Map<
    string,
    {
      totalRevenue: number;
      stores: Map<string, number>;
    }
  >();

  salesData.forEach((sale) => {
    const colorName = sale.colorName || "その他";
    if (!sale.storeName || sale.storeName.trim() === "") return;
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    const storeName = sale.storeName.trim();

    if (!colorStoreMap.has(colorName)) {
      colorStoreMap.set(colorName, {
        totalRevenue: 0,
        stores: new Map(),
      });
    }

    const colorData = colorStoreMap.get(colorName)!;
    colorData.totalRevenue += sale.amount;
    colorData.stores.set(
      storeName,
      (colorData.stores.get(storeName) || 0) + sale.amount
    );
  });

  const result: PerformanceWithStoreBreakdown[] = Array.from(
    colorStoreMap.entries()
  )
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([storeName, revenue]) => ({ storeName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, topN);

  return result;
}

// Material Performance with Store Breakdown
export function getMaterialPerformanceWithStores(
  salesData: SalesRecord[],
  topN: number = 25
): PerformanceWithStoreBreakdown[] {
  // Map: materialName -> Map: storeName -> revenue
  const materialStoreMap = new Map<
    string,
    {
      totalRevenue: number;
      stores: Map<string, number>;
    }
  >();

  salesData.forEach((sale) => {
    const materialName = sale.materialName || "その他";
    if (!sale.storeName || sale.storeName.trim() === "") return;
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    const storeName = sale.storeName.trim();

    if (!materialStoreMap.has(materialName)) {
      materialStoreMap.set(materialName, {
        totalRevenue: 0,
        stores: new Map(),
      });
    }

    const materialData = materialStoreMap.get(materialName)!;
    materialData.totalRevenue += sale.amount;
    materialData.stores.set(
      storeName,
      (materialData.stores.get(storeName) || 0) + sale.amount
    );
  });

  const result: PerformanceWithStoreBreakdown[] = Array.from(
    materialStoreMap.entries()
  )
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([storeName, revenue]) => ({ storeName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, topN);

  return result;
}

// Collection Trends Over Time
export function getCollectionTrends(
  salesData: SalesRecord[],
  topN: number = 10,
  granularity: Granularity = "monthly"
): CollectionTrend[] {
  // Get top collections
  const topCollections = getBrandCollectionPerformance(salesData, "collection");
  const topCollectionNames = new Set(
    topCollections.slice(0, topN).map((c) => c.name)
  );

  // Group by period and collection
  const trendMap = new Map<string, Map<string, number>>();

  salesData.forEach((record) => {
    const collectionName = record.collectionName || "その他";
    if (!topCollectionNames.has(collectionName)) return;
    if (record.transactionType !== "売上" || record.amount <= 0) return;

    const dateStr = record.purchaseDate;
    if (!dateStr) return;

    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return;

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);
    const periodKey = getDateKey(date, granularity);

    if (!trendMap.has(periodKey)) {
      trendMap.set(periodKey, new Map());
    }

    const periodMap = trendMap.get(periodKey)!;
    periodMap.set(
      collectionName,
      (periodMap.get(collectionName) || 0) + record.amount
    );
  });

  // Convert to array format
  const result: CollectionTrend[] = [];
  const sortedDates = Array.from(trendMap.keys()).sort();

  sortedDates.forEach((date) => {
    const periodMap = trendMap.get(date)!;
    const entry: CollectionTrend = { date };

    topCollectionNames.forEach((collectionName) => {
      entry[collectionName] = periodMap.get(collectionName) || 0;
    });

    result.push(entry);
  });

  return result;
}

// Store Performance with Product Breakdown
export function getStorePerformanceWithProducts(
  salesData: SalesRecord[],
  topN: number = 10
): PerformanceWithStoreBreakdown[] {
  // Get top stores
  const topStores = getStorePerformance(salesData);
  const topStoreNames = new Set(
    topStores.slice(0, topN).map((s) => s.storeName)
  );

  // Get top products to limit breakdown
  const topProducts = getTopProducts(salesData, 20);
  const topProductNames = new Set(topProducts.map((p) => p.productName));

  // Map: storeName -> Map: productName -> revenue
  const storeProductMap = new Map<
    string,
    {
      totalRevenue: number;
      stores: Map<string, number>; // Reusing stores field but storing products
    }
  >();

  salesData.forEach((sale) => {
    const storeName = sale.storeName?.trim() || "";
    if (!storeName || !topStoreNames.has(storeName)) return;

    const productName = sale.productName || sale.productCode;
    if (!productName || !topProductNames.has(productName)) return;

    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    if (!storeProductMap.has(storeName)) {
      storeProductMap.set(storeName, {
        totalRevenue: 0,
        stores: new Map(), // Using stores field to store products
      });
    }

    const storeData = storeProductMap.get(storeName)!;
    storeData.totalRevenue += sale.amount;
    storeData.stores.set(
      productName,
      (storeData.stores.get(productName) || 0) + sale.amount
    );
  });

  const result: PerformanceWithStoreBreakdown[] = Array.from(
    storeProductMap.entries()
  )
    .map(([name, data]) => ({
      name,
      totalRevenue: data.totalRevenue,
      stores: Array.from(data.stores.entries())
        .map(([productName, revenue]) => ({ storeName: productName, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return result;
}

// Store Trends Over Time
export function getStoreTrends(
  salesData: SalesRecord[],
  topN: number = 10,
  granularity: Granularity = "monthly"
): StoreTrend[] {
  // Get top stores
  const topStores = getStorePerformance(salesData);
  const topStoreNames = new Set(
    topStores.slice(0, topN).map((s) => s.storeName)
  );

  // Group by period and store
  const trendMap = new Map<string, Map<string, number>>();

  salesData.forEach((record) => {
    const storeName = record.storeName?.trim() || "";
    if (!storeName || !topStoreNames.has(storeName)) return;
    if (record.transactionType !== "売上" || record.amount <= 0) return;

    const dateStr = record.purchaseDate;
    if (!dateStr) return;

    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return;

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);
    const periodKey = getDateKey(date, granularity);

    if (!trendMap.has(periodKey)) {
      trendMap.set(periodKey, new Map());
    }

    const periodMap = trendMap.get(periodKey)!;
    periodMap.set(storeName, (periodMap.get(storeName) || 0) + record.amount);
  });

  // Convert to array format
  const result: StoreTrend[] = [];
  const sortedDates = Array.from(trendMap.keys()).sort();

  sortedDates.forEach((date) => {
    const periodMap = trendMap.get(date)!;
    const entry: StoreTrend = { date };

    topStoreNames.forEach((storeName) => {
      entry[storeName] = periodMap.get(storeName) || 0;
    });

    result.push(entry);
  });

  return result;
}

// Funnel Analysis Functions
// This file contains all funnel-related analysis functions

import type {
  SalesRecord,
  AcquisitionMetrics,
  FirstPurchaseAnalysis,
  PurchaseInterval,
  PurchaseIntervalDistribution,
  FirstRepeatAnalysis,
  BasketAnalysis,
  ProductAffinity,
  CohortData,
  LTVAnalysis,
  ChurnMetrics,
  PurchaseCycleSegment,
} from "../types";
import type { Granularity } from "./dataAnalysis";
import { getCustomerDetails, getDateKey } from './dataAnalysis';

// 1. Acquisition Metrics
export function getAcquisitionMetrics(
  salesData: SalesRecord[],
  granularity: Granularity = "monthly"
): AcquisitionMetrics[] {
  const customerDetails = getCustomerDetails(salesData);
  const periodMap = new Map<
    string,
    {
      newCustomers: Set<string>;
      returningCustomers: Set<string>;
      newRevenue: number;
      returningRevenue: number;
    }
  >();

  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    const dateMatch = sale.purchaseDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return;

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);
    const periodKey = getDateKey(date, granularity);

    const customer = customerDetails.get(sale.memberId);
    if (!customer) return;

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, {
        newCustomers: new Set(),
        returningCustomers: new Set(),
        newRevenue: 0,
        returningRevenue: 0,
      });
    }

    const period = periodMap.get(periodKey)!;
    const isFirstPurchase = customer.firstPurchaseDate === sale.purchaseDate;

    if (isFirstPurchase) {
      period.newCustomers.add(sale.memberId);
      period.newRevenue += sale.amount;
    } else {
      period.returningCustomers.add(sale.memberId);
      period.returningRevenue += sale.amount;
    }
  });

  const result: AcquisitionMetrics[] = Array.from(periodMap.entries())
    .map(([period, data]) => ({
      period,
      newCustomers: data.newCustomers.size,
      returningCustomers: data.returningCustomers.size,
      newCustomerRevenue: data.newRevenue,
      returningCustomerRevenue: data.returningRevenue,
      newCustomerAOV:
        data.newCustomers.size > 0
          ? data.newRevenue / data.newCustomers.size
          : 0,
      returningCustomerAOV:
        data.returningCustomers.size > 0
          ? data.returningRevenue / data.returningCustomers.size
          : 0,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  return result;
}

// 2. First Purchase Analysis
export function getFirstPurchaseAnalysis(
  salesData: SalesRecord[]
): FirstPurchaseAnalysis {
  const customerDetails = getCustomerDetails(salesData);
  const firstPurchases = new Map<string, SalesRecord>();
  const categoryMap = new Map<string, { count: number; revenue: number }>();
  const monthMap = new Map<string, { count: number; revenue: number }>();

  let totalFirstPurchaseValue = 0;

  // Get all first purchases
  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;
    const customer = customerDetails.get(sale.memberId);
    if (!customer) return;

    if (customer.firstPurchaseDate === sale.purchaseDate) {
      if (!firstPurchases.has(sale.memberId)) {
        firstPurchases.set(sale.memberId, sale);
        totalFirstPurchaseValue += sale.amount;

        const category = sale.itemName || sale.productCategoryName || "その他";
        const catData = categoryMap.get(category) || { count: 0, revenue: 0 };
        catData.count++;
        catData.revenue += sale.amount;
        categoryMap.set(category, catData);

        const dateMatch = sale.purchaseDate.match(/^(\d{4})-(\d{2})/);
        if (dateMatch) {
          const monthKey = `${dateMatch[1]}-${dateMatch[2]}`;
          const monthData = monthMap.get(monthKey) || { count: 0, revenue: 0 };
          monthData.count++;
          monthData.revenue += sale.amount;
          monthMap.set(monthKey, monthData);
        }
      }
    }
  });

  const firstPurchaseCategories = Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const firstPurchaseByMonth = Array.from(monthMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalNewCustomers: firstPurchases.size,
    averageFirstPurchaseValue:
      firstPurchases.size > 0
        ? totalFirstPurchaseValue / firstPurchases.size
        : 0,
    averageTimeToFirstPurchase: 0, // Would need registration date
    firstPurchaseCategories,
    firstPurchaseByMonth,
  };
}

// 3. Purchase Interval Analysis
export function getPurchaseIntervals(
  salesData: SalesRecord[]
): PurchaseInterval[] {
  const customerPurchases = new Map<string, SalesRecord[]>();

  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;
    if (!customerPurchases.has(sale.memberId)) {
      customerPurchases.set(sale.memberId, []);
    }
    customerPurchases.get(sale.memberId)!.push(sale);
  });

  const intervals: PurchaseInterval[] = [];

  customerPurchases.forEach((purchases, customerId) => {
    if (purchases.length < 2) return; // Need at least 2 purchases

    purchases.sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));

    const customerIntervals: number[] = [];
    for (let i = 1; i < purchases.length; i++) {
      const date1 = purchases[i - 1].purchaseDate.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );
      const date2 = purchases[i].purchaseDate.match(/^(\d{4})-(\d{2})-(\d{2})/);

      if (date1 && date2) {
        const d1 = new Date(
          parseInt(date1[1]),
          parseInt(date1[2]) - 1,
          parseInt(date1[3])
        );
        const d2 = new Date(
          parseInt(date2[1]),
          parseInt(date2[2]) - 1,
          parseInt(date2[3])
        );
        const days = Math.floor(
          (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)
        );
        customerIntervals.push(days);
      }
    }

    if (customerIntervals.length > 0) {
      const averageInterval =
        customerIntervals.reduce((sum, d) => sum + d, 0) /
        customerIntervals.length;
      intervals.push({
        customerId,
        averageInterval,
        purchaseCount: purchases.length,
        intervals: customerIntervals,
      });
    }
  });

  return intervals;
}

export function getPurchaseIntervalDistribution(
  intervals: PurchaseInterval[]
): PurchaseIntervalDistribution[] {
  const distribution = new Map<string, number>();

  intervals.forEach((interval) => {
    let range = "";
    if (interval.averageInterval <= 30) range = "0-30 days";
    else if (interval.averageInterval <= 60) range = "31-60 days";
    else if (interval.averageInterval <= 90) range = "61-90 days";
    else if (interval.averageInterval <= 180) range = "91-180 days";
    else if (interval.averageInterval <= 365) range = "181-365 days";
    else range = "365+ days";

    distribution.set(range, (distribution.get(range) || 0) + 1);
  });

  const total = intervals.length;
  return Array.from(distribution.entries())
    .map(([intervalRange, customerCount]) => ({
      intervalRange,
      customerCount,
      percentage: total > 0 ? (customerCount / total) * 100 : 0,
    }))
    .sort((a, b) => {
      const order = [
        "0-30 days",
        "31-60 days",
        "61-90 days",
        "91-180 days",
        "181-365 days",
        "365+ days",
      ];
      return order.indexOf(a.intervalRange) - order.indexOf(b.intervalRange);
    });
}

export function getPurchaseCycleSegments(
  intervals: PurchaseInterval[],
  salesData: SalesRecord[]
): PurchaseCycleSegment[] {
  const customerDetails = getCustomerDetails(salesData);
  const cycleSegments: PurchaseCycleSegment[] = [
    {
      segment: "Very Regular (0-30 days)",
      count: 0,
      averageInterval: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Regular (31-90 days)",
      count: 0,
      averageInterval: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Occasional (91-180 days)",
      count: 0,
      averageInterval: 0,
      averageRevenue: 0,
      percentage: 0,
    },
    {
      segment: "Infrequent (180+ days)",
      count: 0,
      averageInterval: 0,
      averageRevenue: 0,
      percentage: 0,
    },
  ];

  intervals.forEach((interval) => {
    const customer = customerDetails.get(interval.customerId);
    const revenue = customer?.totalRevenue || 0;

    if (interval.averageInterval <= 30) {
      cycleSegments[0].count++;
      cycleSegments[0].averageInterval += interval.averageInterval;
      cycleSegments[0].averageRevenue += revenue;
    } else if (interval.averageInterval <= 90) {
      cycleSegments[1].count++;
      cycleSegments[1].averageInterval += interval.averageInterval;
      cycleSegments[1].averageRevenue += revenue;
    } else if (interval.averageInterval <= 180) {
      cycleSegments[2].count++;
      cycleSegments[2].averageInterval += interval.averageInterval;
      cycleSegments[2].averageRevenue += revenue;
    } else {
      cycleSegments[3].count++;
      cycleSegments[3].averageInterval += interval.averageInterval;
      cycleSegments[3].averageRevenue += revenue;
    }
  });

  const total = intervals.length;
  cycleSegments.forEach((segment) => {
    segment.averageInterval =
      segment.count > 0 ? segment.averageInterval / segment.count : 0;
    segment.averageRevenue =
      segment.count > 0 ? segment.averageRevenue / segment.count : 0;
    segment.percentage = total > 0 ? (segment.count / total) * 100 : 0;
  });

  return cycleSegments;
}

// 4. First vs Repeat Purchase Analysis
export function getFirstRepeatAnalysis(
  salesData: SalesRecord[]
): FirstRepeatAnalysis {
  const customerDetails = getCustomerDetails(salesData);
  const customerPurchases = new Map<
    string,
    { first: SalesRecord[]; repeat: SalesRecord[] }
  >();

  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;
    const customer = customerDetails.get(sale.memberId);
    if (!customer) return;

    if (!customerPurchases.has(sale.memberId)) {
      customerPurchases.set(sale.memberId, { first: [], repeat: [] });
    }

    const purchases = customerPurchases.get(sale.memberId)!;
    if (customer.firstPurchaseDate === sale.purchaseDate) {
      purchases.first.push(sale);
    } else {
      purchases.repeat.push(sale);
    }
  });

  let totalFirstPurchaseValue = 0;
  let totalRepeatPurchaseValue = 0;
  let customersWithRepeat = 0;
  let totalDaysToSecond = 0;
  const categoryMap = new Map<string, { first: number; repeat: number }>();

  customerPurchases.forEach((purchases) => {
    if (purchases.first.length > 0) {
      const firstValue = purchases.first.reduce((sum, s) => sum + s.amount, 0);
      totalFirstPurchaseValue += firstValue;

      purchases.first.forEach((sale) => {
        const category = sale.itemName || sale.productCategoryName || "その他";
        const cat = categoryMap.get(category) || { first: 0, repeat: 0 };
        cat.first += sale.amount;
        categoryMap.set(category, cat);
      });

      if (purchases.repeat.length > 0) {
        customersWithRepeat++;
        const repeatValue = purchases.repeat.reduce(
          (sum, s) => sum + s.amount,
          0
        );
        totalRepeatPurchaseValue += repeatValue;

        purchases.repeat.forEach((sale) => {
          const category =
            sale.itemName || sale.productCategoryName || "その他";
          const cat = categoryMap.get(category) || { first: 0, repeat: 0 };
          cat.repeat += sale.amount;
          categoryMap.set(category, cat);
        });

        // Calculate days to second purchase
        purchases.first.sort((a, b) =>
          a.purchaseDate.localeCompare(b.purchaseDate)
        );
        purchases.repeat.sort((a, b) =>
          a.purchaseDate.localeCompare(b.purchaseDate)
        );
        if (purchases.first.length > 0 && purchases.repeat.length > 0) {
          const firstDate = purchases.first[0].purchaseDate.match(
            /^(\d{4})-(\d{2})-(\d{2})/
          );
          const secondDate = purchases.repeat[0].purchaseDate.match(
            /^(\d{4})-(\d{2})-(\d{2})/
          );
          if (firstDate && secondDate) {
            const d1 = new Date(
              parseInt(firstDate[1]),
              parseInt(firstDate[2]) - 1,
              parseInt(firstDate[3])
            );
            const d2 = new Date(
              parseInt(secondDate[1]),
              parseInt(secondDate[2]) - 1,
              parseInt(secondDate[3])
            );
            totalDaysToSecond += Math.floor(
              (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)
            );
          }
        }
      }
    }
  });

  const totalCustomers = customerPurchases.size;
  const categoryProgression = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      firstPurchase: data.first,
      repeatPurchase: data.repeat,
    }))
    .sort((a, b) => b.firstPurchase - a.firstPurchase);

  return {
    firstPurchaseValue:
      totalCustomers > 0 ? totalFirstPurchaseValue / totalCustomers : 0,
    repeatPurchaseValue:
      customersWithRepeat > 0
        ? totalRepeatPurchaseValue / customersWithRepeat
        : 0,
    secondPurchaseRate:
      totalCustomers > 0 ? (customersWithRepeat / totalCustomers) * 100 : 0,
    averageDaysToSecondPurchase:
      customersWithRepeat > 0 ? totalDaysToSecond / customersWithRepeat : 0,
    categoryProgression,
  };
}

// 5. Basket Analysis
export function getBasketAnalysis(salesData: SalesRecord[]): BasketAnalysis[] {
  const transactionMap = new Map<string, BasketAnalysis>();

  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    if (!transactionMap.has(sale.transactionNumber)) {
      transactionMap.set(sale.transactionNumber, {
        transactionNumber: sale.transactionNumber,
        itemCount: 0,
        totalValue: 0,
        items: [],
      });
    }

    const basket = transactionMap.get(sale.transactionNumber)!;
    basket.itemCount += sale.quantity;
    basket.totalValue += sale.amount;
    basket.items.push(sale.productName || sale.productCode);
  });

  return Array.from(transactionMap.values());
}

export function getProductAffinity(
  baskets: BasketAnalysis[],
  minSupport: number = 10
): ProductAffinity[] {
  const productPairs = new Map<
    string,
    { coOccurrence: number; productA: string; productB: string }
  >();
  const productCount = new Map<string, number>();

  baskets.forEach((basket) => {
    const items = [...new Set(basket.items)];

    items.forEach((item) => {
      productCount.set(item, (productCount.get(item) || 0) + 1);
    });

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const pair = [items[i], items[j]].sort().join("|");
        const pairData = productPairs.get(pair) || {
          coOccurrence: 0,
          productA: items[i],
          productB: items[j],
        };
        pairData.coOccurrence++;
        productPairs.set(pair, pairData);
      }
    }
  });

  const totalTransactions = baskets.length;
  const affinity: ProductAffinity[] = [];

  productPairs.forEach((pair) => {
    if (pair.coOccurrence >= minSupport) {
      const supportA =
        (productCount.get(pair.productA) || 0) / totalTransactions;
      const supportPair = pair.coOccurrence / totalTransactions;
      const confidence = supportA > 0 ? supportPair / supportA : 0;

      affinity.push({
        productA: pair.productA,
        productB: pair.productB,
        coOccurrence: pair.coOccurrence,
        support: supportPair * 100,
        confidence: confidence * 100,
      });
    }
  });

  return affinity.sort((a, b) => b.confidence - a.confidence).slice(0, 50);
}

// 6. Cohort Analysis
export function getCohortAnalysis(salesData: SalesRecord[]): CohortData[] {
  const customerDetails = getCustomerDetails(salesData);
  const cohortMap = new Map<
    string,
    {
      customers: Set<string>;
      purchasesByPeriod: Map<
        string,
        { revenue: number; customers: Set<string> }
      >;
    }
  >();

  // Group customers by acquisition cohort (month of first purchase)
  customerDetails.forEach((customer, memberId) => {
    const dateMatch = customer.firstPurchaseDate.match(/^(\d{4})-(\d{2})/);
    if (!dateMatch) return;

    const cohort = `${dateMatch[1]}-${dateMatch[2]}`;
    if (!cohortMap.has(cohort)) {
      cohortMap.set(cohort, {
        customers: new Set(),
        purchasesByPeriod: new Map(),
      });
    }
    cohortMap.get(cohort)!.customers.add(memberId);
  });

  // Calculate revenue by period for each cohort
  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    const customer = customerDetails.get(sale.memberId);
    if (!customer) return;

    const dateMatch = customer.firstPurchaseDate.match(/^(\d{4})-(\d{2})/);
    if (!dateMatch) return;

    const cohort = `${dateMatch[1]}-${dateMatch[2]}`;
    const purchaseDateMatch = sale.purchaseDate.match(/^(\d{4})-(\d{2})/);
    if (!purchaseDateMatch) return;

    // Calculate period index (0 = first month, 1 = second month, etc.)
    const cohortDate = new Date(
      parseInt(dateMatch[1]),
      parseInt(dateMatch[2]) - 1
    );
    const purchaseDate = new Date(
      parseInt(purchaseDateMatch[1]),
      parseInt(purchaseDateMatch[2]) - 1
    );
    const periodIndex =
      (purchaseDate.getFullYear() - cohortDate.getFullYear()) * 12 +
      (purchaseDate.getMonth() - cohortDate.getMonth());

    const cohortData = cohortMap.get(cohort);
    if (!cohortData) return;

    const periodKey = `period${Math.min(periodIndex, 5)}`;
    if (!cohortData.purchasesByPeriod.has(periodKey)) {
      cohortData.purchasesByPeriod.set(periodKey, {
        revenue: 0,
        customers: new Set(),
      });
    }
    const period = cohortData.purchasesByPeriod.get(periodKey)!;
    period.revenue += sale.amount;
    period.customers.add(sale.memberId);
  });

  // Build result
  const result: CohortData[] = [];
  cohortMap.forEach((cohortData, cohort) => {
    const customerCount = cohortData.customers.size;
    let totalRevenue = 0;

    const periods: number[] = [0, 0, 0, 0, 0, 0];
    cohortData.purchasesByPeriod.forEach((period, key) => {
      const index = parseInt(key.replace("period", ""));
      if (index >= 0 && index <= 5) {
        periods[index] = period.revenue;
        totalRevenue += period.revenue;
      }
    });

    // Calculate retention (customers active in period 1+)
    const period1Customers =
      cohortData.purchasesByPeriod.get("period1")?.customers.size || 0;
    const retentionRate =
      customerCount > 0 ? (period1Customers / customerCount) * 100 : 0;

    result.push({
      cohort,
      customers: customerCount,
      period0: periods[0],
      period1: periods[1],
      period2: periods[2],
      period3: periods[3],
      period4: periods[4],
      period5: periods[5],
      totalRevenue,
      averageLTV: customerCount > 0 ? totalRevenue / customerCount : 0,
      retentionRate,
    });
  });

  return result.sort((a, b) => a.cohort.localeCompare(b.cohort));
}

// 7. LTV Trends
export function getLTVAnalysis(
  salesData: SalesRecord[],
  granularity: Granularity = "monthly"
): LTVAnalysis[] {
  const customerDetails = getCustomerDetails(salesData);
  const periodMap = new Map<
    string,
    {
      ltvValues: number[];
      bySegment: Map<string, { ltv: number; count: number }>;
    }
  >();

  // Get segment assignments
  const segmentMap = new Map<string, string>();
  customerDetails.forEach((customer) => {
    let segment = "Occasional";
    if (customer.totalRevenue >= 100000) segment = "VIP";
    else if (customer.totalRevenue >= 50000) segment = "High Value";
    else if (customer.totalRevenue >= 20000) segment = "Regular";
    segmentMap.set(customer.memberId, segment);
  });

  customerDetails.forEach((customer) => {
    const dateMatch = customer.firstPurchaseDate.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );
    if (!dateMatch) return;

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);
    const periodKey = getDateKey(date, granularity);

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, {
        ltvValues: [],
        bySegment: new Map(),
      });
    }

    const period = periodMap.get(periodKey)!;
    period.ltvValues.push(customer.totalRevenue);

    const segment = segmentMap.get(customer.memberId) || "Occasional";
    const segData = period.bySegment.get(segment) || { ltv: 0, count: 0 };
    segData.ltv += customer.totalRevenue;
    segData.count++;
    period.bySegment.set(segment, segData);
  });

  return Array.from(periodMap.entries())
    .map(([period, data]) => {
      const sorted = [...data.ltvValues].sort((a, b) => a - b);
      const median =
        sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
      const average =
        data.ltvValues.length > 0
          ? data.ltvValues.reduce((sum, v) => sum + v, 0) /
            data.ltvValues.length
          : 0;

      const ltvBySegment = Array.from(data.bySegment.entries()).map(
        ([segment, segData]) => ({
          segment,
          averageLTV: segData.count > 0 ? segData.ltv / segData.count : 0,
          count: segData.count,
        })
      );

      return {
        period,
        averageLTV: average,
        medianLTV: median,
        ltvBySegment,
        ltvTrend: data.ltvValues,
      };
    })
    .sort((a, b) => a.period.localeCompare(b.period));
}

// 8. Churn Metrics
export function getChurnMetrics(
  salesData: SalesRecord[],
  granularity: Granularity = "monthly"
): ChurnMetrics[] {
  const customerDetails = getCustomerDetails(salesData);
  const periodMap = new Map<
    string,
    {
      activeCustomers: Set<string>;
      newCustomers: Set<string>;
      lastSeen: Map<string, string>;
    }
  >();

  salesData.forEach((sale) => {
    if (sale.transactionType !== "売上" || sale.amount <= 0) return;

    const dateMatch = sale.purchaseDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return;

    const year = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    const date = new Date(year, month, day);
    const periodKey = getDateKey(date, granularity);

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, {
        activeCustomers: new Set(),
        newCustomers: new Set(),
        lastSeen: new Map(),
      });
    }

    const period = periodMap.get(periodKey)!;
    period.activeCustomers.add(sale.memberId);

    const customer = customerDetails.get(sale.memberId);
    if (customer && customer.firstPurchaseDate === sale.purchaseDate) {
      period.newCustomers.add(sale.memberId);
    }

    const currentLastSeen = period.lastSeen.get(sale.memberId);
    if (!currentLastSeen || sale.purchaseDate > currentLastSeen) {
      period.lastSeen.set(sale.memberId, sale.purchaseDate);
    }
  });

  const periods = Array.from(periodMap.keys()).sort();
  const result: ChurnMetrics[] = [];

  for (let i = 0; i < periods.length; i++) {
    const currentPeriod = periods[i];
    const current = periodMap.get(currentPeriod)!;

    let churnedCustomers = 0;
    if (i > 0) {
      const previousPeriod = periods[i - 1];
      const previous = periodMap.get(previousPeriod)!;

      previous.activeCustomers.forEach((customerId) => {
        if (!current.activeCustomers.has(customerId)) {
          churnedCustomers++;
        }
      });
    }

    const activeCount = current.activeCustomers.size;
    const previousActiveCount =
      i > 0 ? periodMap.get(periods[i - 1])!.activeCustomers.size : activeCount;

    const churnRate =
      previousActiveCount > 0
        ? (churnedCustomers / previousActiveCount) * 100
        : 0;

    const retentionRate =
      previousActiveCount > 0
        ? ((previousActiveCount - churnedCustomers) / previousActiveCount) * 100
        : 100;

    result.push({
      period: currentPeriod,
      activeCustomers: activeCount,
      churnedCustomers,
      churnRate,
      retentionRate,
      newCustomers: current.newCustomers.size,
      netCustomerGrowth:
        activeCount -
        (i > 0 ? periodMap.get(periods[i - 1])!.activeCustomers.size : 0),
    });
  }

  return result;
}

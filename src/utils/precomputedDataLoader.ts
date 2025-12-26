export interface PrecomputedData {
  kpis: any;
  trendDataDaily: any[];
  trendDataWeekly: any[];
  trendDataMonthly: any[];
  birthdayDataCustomer: any[];
  birthdayDataImportantPerson: any[];
  dayOfWeekData: any[];
  colorTrends: any[];
  materialTrends: any[];
  customerSegments: any[];
  productTrends: any[];
  collectionTrends: any[];
  productPerformanceWithStores: any[];
  collectionPerformanceWithStores: any[];
  storePerformanceWithProducts: any[];
  storeTrends: any[];
  rfmSegments: any[];
  frequencySegments: any[];
  recencySegments: any[];
  channelSegments: any[];
  aovSegments: any[];
}

let cachedData: PrecomputedData | null = null;

export async function loadPrecomputedData(): Promise<PrecomputedData> {
  if (cachedData) {
    console.log("📦 Using cached precomputed data");
    return cachedData;
  }

  const baseUrl = import.meta.env.BASE_URL;
  const url = `${baseUrl}data/precomputed.json`;
  console.log("📥 Loading precomputed data from:", url);

  const response = await fetch(url);

  if (!response.ok) {
    const errorMsg =
      `Failed to load precomputed data from ${url}: ${response.statusText}. ` +
      `Make sure you've run 'npm run precompute' before building.`;
    console.error("❌", errorMsg);
    throw new Error(errorMsg);
  }

  const data = (await response.json()) as PrecomputedData;

  // Verify we got valid precomputed data
  if (!data.kpis || !data.trendDataMonthly || !data.productTrends) {
    throw new Error(
      'Invalid precomputed data format. Please regenerate with "npm run precompute"'
    );
  }

  console.log("✅ Precomputed data loaded successfully:", {
    kpis: !!data.kpis,
    trends: data.trendDataMonthly?.length || 0,
    productTrends: data.productTrends?.length || 0,
    totalKeys: Object.keys(data).length,
  });

  cachedData = data;
  return data;
}

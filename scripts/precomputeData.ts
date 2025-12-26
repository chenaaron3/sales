import { readFileSync, writeFileSync } from 'fs';
import Papa from 'papaparse';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Import analysis functions - tsx can handle TypeScript imports
import * as dataAnalysis from '../src/utils/dataAnalysis';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Type definitions
interface SalesRecord {
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

interface MemberRecord {
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

// Parse CSV functions (same as dataParser.ts but for Node.js)
function parseSalesCSV(csvText: string): SalesRecord[] {
  const lines = csvText.split("\n");
  const csvWithoutFirstLine = lines.slice(1).join("\n");

  const results = Papa.parse(csvWithoutFirstLine, {
    header: true,
    skipEmptyLines: true,
  });

  const transformed = results.data
    .map((row: any) => ({
      recordUpdateDate: row["レコード更新日時"] || "",
      recordAddDate: row["レコード追加日時"] || "",
      memberId: row["jouete会員番号"] || "",
      transactionNumber: row["取引通番"] || "",
      purchaseDate: row["購入日付"] || "",
      cardNumber: row["カード番号"] || "",
      productCode: row["商品コード"] || "",
      productName: row["商品名"] || "",
      quantity: parseFloat(row["数量"] || "0"),
      unitPrice: parseFloat(row["単価"] || "0"),
      amount: parseFloat(row["金額"] || "0"),
      storeCode: row["店舗コード"] || "",
      storeName: row["店舗名"] || "",
      staffCode: row["担当者コード"] || "",
      staffName: row["担当者名"] || "",
      brand: row["ブランド"] || "",
      collectionCode: row["コレクションコード"] || "",
      collectionName: row["コレクション名"] || "",
      productCategoryCode: row["商品分類"] || "",
      productCategoryName: row["商品分類名"] || "",
      itemCode: row["アイテムコード"] || "",
      itemName: row["アイテム名"] || "",
      materialCode: row["素材コード"] || "",
      materialName: row["素材名"] || "",
      colorCode: row["カラーコード"] || "",
      colorName: row["カラー名"] || "",
      transactionType: row["取引名"] || "",
    }))
    .filter((row: any) => row.memberId && row.purchaseDate);

  return transformed as SalesRecord[];
}

function parseMemberCSV(csvText: string): MemberRecord[] {
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const transformed = results.data
    .map((row: any) => ({
      memberId: row["jouete会員番号"] || "",
      birthDate: row["生年月日"] || null,
      gender: row["性別"] || null,
      newsletterFlag: row["メルマガ希望フラグ"] || "",
      dmFlag: row["DM送付希望フラグ"] || "",
      favoriteStore: row["お気に入り店舗"] || null,
      importantPersonBirthday: row["大事な方のお誕生日"] || null,
      anniversary: row["記念日"] || null,
      firstRegisteredStore: row["初回登録店舗"] || null,
    }))
    .filter((row: any) => row.memberId);

  return transformed as MemberRecord[];
}

// Main precomputation function
function precomputeData() {
  console.log("🚀 Starting data precomputation...");

  // Read CSV files
  const publicDir = join(__dirname, "..", "public", "data");
  const salesCsvPath = join(publicDir, "sales_jouete_1y.csv");
  const memberCsvPath = join(publicDir, "member_jouete.csv");

  console.log("📖 Reading CSV files...");
  const salesCsv = readFileSync(salesCsvPath, "utf-8");
  const memberCsv = readFileSync(memberCsvPath, "utf-8");

  // Parse CSV files
  console.log("🔍 Parsing CSV files...");
  const salesData = parseSalesCSV(salesCsv);
  const memberData = parseMemberCSV(memberCsv);

  // Filter data - default to Q3 2024 onwards
  const filteredData = salesData.filter((record) => {
    if (!record.purchaseDate) return false;
    if (record.purchaseDate < "2024-07-01") return false;
    if (record.transactionType !== "売上" || record.amount <= 0) return false;
    return true;
  });

  console.log(
    `✅ Processed ${filteredData.length} sales records and ${memberData.length} member records`
  );

  // Precompute all analysis values
  console.log("⚙️  Computing analysis values...");

  const precomputed = {
    // KPIs
    kpis: dataAnalysis.calculateKPIs(filteredData),

    // Trends - multiple granularities
    trendDataDaily: dataAnalysis.getTrendsByGranularity(filteredData, "daily"),
    trendDataWeekly: dataAnalysis.getTrendsByGranularity(
      filteredData,
      "weekly"
    ),
    trendDataMonthly: dataAnalysis.getTrendsByGranularity(
      filteredData,
      "monthly"
    ),

    // Birthday analysis - both types
    birthdayDataCustomer: dataAnalysis.getBirthdaySalesCorrelation(
      filteredData,
      memberData,
      30,
      "customer"
    ),
    birthdayDataImportantPerson: dataAnalysis.getBirthdaySalesCorrelation(
      filteredData,
      memberData,
      30,
      "importantPerson"
    ),

    // Anniversary sales correlation
    anniversaryData: dataAnalysis.getAnniversarySalesCorrelation(
      filteredData,
      memberData,
      30
    ),

    // Attribute trends
    colorTrends: dataAnalysis.getAttributeTrends(
      filteredData,
      "color",
      "monthly"
    ),
    materialTrends: dataAnalysis.getAttributeTrends(
      filteredData,
      "material",
      "monthly"
    ),

    // Customer segments
    customerSegments: dataAnalysis.getCustomerSegments(filteredData),

    // Day of week
    dayOfWeekData: dataAnalysis.getDayOfWeekAnalysis(filteredData),

    // Product trends (daily, weekly, monthly)
    productTrendsDaily: dataAnalysis.getProductTrends(
      filteredData,
      25,
      "daily"
    ),
    productTrendsWeekly: dataAnalysis.getProductTrends(
      filteredData,
      25,
      "weekly"
    ),
    productTrendsMonthly: dataAnalysis.getProductTrends(
      filteredData,
      25,
      "monthly"
    ),
    collectionTrendsDaily: dataAnalysis.getCollectionTrends(
      filteredData,
      25,
      "daily"
    ),
    collectionTrendsWeekly: dataAnalysis.getCollectionTrends(
      filteredData,
      25,
      "weekly"
    ),
    collectionTrendsMonthly: dataAnalysis.getCollectionTrends(
      filteredData,
      25,
      "monthly"
    ),
    categoryTrendsWeekly: dataAnalysis.getCategoryTrends(
      filteredData,
      25,
      "weekly"
    ),
    categoryTrendsMonthly: dataAnalysis.getCategoryTrends(
      filteredData,
      25,
      "monthly"
    ),

    // Product performance with stores
    productPerformanceWithStores: dataAnalysis.getProductPerformanceWithStores(
      filteredData,
      25
    ),
    collectionPerformanceWithStores:
      dataAnalysis.getCollectionPerformanceWithStores(filteredData, 25),
    categoryPerformanceWithStores:
      dataAnalysis.getCategoryPerformanceWithStores(filteredData, 25),
    colorPerformanceWithStores: dataAnalysis.getColorPerformanceWithStores(
      filteredData,
      25
    ),
    materialPerformanceWithStores:
      dataAnalysis.getMaterialPerformanceWithStores(filteredData, 25),

    // Store performance
    storePerformanceWithProducts: dataAnalysis.getStorePerformanceWithProducts(
      filteredData,
      25
    ),
    // Store trends (daily, weekly, monthly)
    storeTrendsDaily: dataAnalysis.getStoreTrends(filteredData, 25, "daily"),
    storeTrendsWeekly: dataAnalysis.getStoreTrends(filteredData, 25, "weekly"),
    storeTrendsMonthly: dataAnalysis.getStoreTrends(
      filteredData,
      25,
      "monthly"
    ),

    // Advanced segmentation
    rfmSegments: dataAnalysis.getRFMSegments(filteredData),
    rfmMatrix: dataAnalysis.getRFMMatrix(filteredData),
    frequencySegments: dataAnalysis.getFrequencySegments(filteredData),
    ageSegments: dataAnalysis.getAgeSegments(filteredData, memberData),
    genderSegments: dataAnalysis.getGenderSegments(filteredData, memberData),
    channelSegments: dataAnalysis.getChannelSegments(filteredData),
    aovSegments: dataAnalysis.getAOVSegments(filteredData),

    // Employee performance (all employees, no limit)
    employeePerformance: dataAnalysis.getEmployeePerformance(filteredData),
  };

  // Write to JSON file
  const outputPath = join(publicDir, "precomputed.json");
  console.log("💾 Writing precomputed data to", outputPath);
  writeFileSync(outputPath, JSON.stringify(precomputed, null, 2), "utf-8");

  console.log("✅ Data precomputation complete!");
  console.log(
    `📊 Precomputed ${Object.keys(precomputed).length} analysis results`
  );
}

// Run precomputation
try {
  precomputeData();
} catch (error) {
  console.error("❌ Error during precomputation:", error);
  process.exit(1);
}

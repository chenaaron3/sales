import { createReadStream, readFileSync, writeFileSync } from "fs";
import Papa from "papaparse";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as dataAnalysis from "../src/utils/dataAnalysis";
import type { SalesRecord, MemberRecord, StoreCustomerRankRecord } from "../src/types";
import type { DataSourceId } from "../src/utils/csvMappers";
import {
  mapJoueteSalesRow,
  mapJoueteMemberRow,
  mapMarkSalesRow,
  mapMarkMemberRow,
  mapMarkStoreCustomerRankRow,
} from "../src/utils/csvMappers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_SOURCE = (process.env.DATA_SOURCE || "mark") as DataSourceId;
const VALID_SOURCES: DataSourceId[] = ["jouete", "mark"];

if (!VALID_SOURCES.includes(DATA_SOURCE)) {
  console.error(`❌ Invalid DATA_SOURCE="${DATA_SOURCE}". Use: jouete | mark`);
  process.exit(1);
}

function parseSalesCsvJouete(csvText: string): SalesRecord[] {
  const lines = csvText.split("\n");
  const csvWithoutFirstLine = lines.slice(1).join("\n");
  const results = Papa.parse<Record<string, string>>(csvWithoutFirstLine, {
    header: true,
    skipEmptyLines: true,
  });
  return results.data
    .map((row) => mapJoueteSalesRow(row))
    .filter((r) => r.memberId && r.purchaseDate);
}

function parseMemberCsvJouete(csvText: string): MemberRecord[] {
  const results = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return results.data.map((row) => mapJoueteMemberRow(row)).filter((r) => r.memberId);
}

function parseSalesCsvMark(csvText: string): SalesRecord[] {
  const results = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return results.data
    .map((row) => mapMarkSalesRow(row))
    .filter((r) => r.memberId && r.purchaseDate);
}

function parseMemberCsvMark(csvText: string): MemberRecord[] {
  const results = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return results.data.map((row) => mapMarkMemberRow(row)).filter((r) => r.memberId);
}

function parseStoreCustomerRanksCsvMark(csvText: string): StoreCustomerRankRecord[] {
  const results = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return results.data.map((row) => mapMarkStoreCustomerRankRow(row)).filter((r) => r.memberId);
}

/**
 * Streams Mark membership CSV and returns only members whose memberId is in
 * allowedMemberIds (if provided). This keeps memory low when the membership
 * file is huge (e.g. 4.8M rows) but we only need members that have sales.
 */
function parseMemberCsvMarkStream(
  memberCsvPath: string,
  allowedMemberIds?: Set<string>
): Promise<MemberRecord[]> {
  return new Promise((resolve, reject) => {
    const rows: MemberRecord[] = [];
    const stream = createReadStream(memberCsvPath, { encoding: "utf-8" }).pipe(
      Papa.parse(Papa.NODE_STREAM_INPUT, { header: true, skipEmptyLines: true })
    );
    stream.on("data", (row: Record<string, string>) => {
      const mapped = mapMarkMemberRow(row);
      if (!mapped.memberId) return;
      if (allowedMemberIds && !allowedMemberIds.has(mapped.memberId)) return;
      rows.push(mapped);
    });
    stream.on("end", () => resolve(rows));
    stream.on("error", reject);
  });
}

async function precomputeData() {
  console.log(`🚀 Starting data precomputation (DATA_SOURCE=${DATA_SOURCE})...`);

  let salesData: SalesRecord[];
  let memberData: MemberRecord[];
  let storeCustomerRanks: StoreCustomerRankRecord[] | undefined;

  if (DATA_SOURCE === "jouete") {
    const publicDir = join(__dirname, "..", "public", "data");
    const salesCsvPath = join(publicDir, "sales_jouete_1y.csv");
    const memberCsvPath = join(publicDir, "member_jouete.csv");
    console.log("📖 Reading CSV files from public/data...");
    const salesCsv = readFileSync(salesCsvPath, "utf-8");
    const memberCsv = readFileSync(memberCsvPath, "utf-8");
    salesData = parseSalesCsvJouete(salesCsv);
    memberData = parseMemberCsvJouete(memberCsv);
  } else {
    const srcDataDir = join(__dirname, "..", "src", "data");
    const salesCsvPath = join(srcDataDir, "mark_sales_202602131852.csv");
    const memberCsvPath = join(srcDataDir, "mark_membership.csv");
    const ranksCsvPath = join(srcDataDir, "mark_store_customer_ranks.csv");
    console.log("📖 Reading CSV files from src/data (Mark)...");
    salesData = parseSalesCsvMark(readFileSync(salesCsvPath, "utf-8"));
    const salesMemberIds = new Set(salesData.map((r) => r.memberId));
    console.log("📖 Streaming membership (keeping only members with sales)...");
    memberData = await parseMemberCsvMarkStream(memberCsvPath, salesMemberIds);
    storeCustomerRanks = parseStoreCustomerRanksCsvMark(readFileSync(ranksCsvPath, "utf-8"));
  }

  const filteredData = salesData.filter((record) => {
    if (!record.purchaseDate) return false;
    if (record.purchaseDate < "2024-07-01") return false;
    if (record.transactionType !== "売上" || record.amount <= 0) return false;
    return true;
  });

  console.log(
    `✅ Processed ${filteredData.length} sales records and ${memberData.length} member records` +
      (storeCustomerRanks ? `, ${storeCustomerRanks.length} store-customer rank records` : "")
  );

  console.log("⚙️  Computing analysis values...");

  const precomputed: Record<string, unknown> = {
    dataSource: DATA_SOURCE,
    kpis: dataAnalysis.calculateKPIs(filteredData),
    trendDataDaily: dataAnalysis.getTrendsByGranularity(filteredData, "daily"),
    trendDataWeekly: dataAnalysis.getTrendsByGranularity(filteredData, "weekly"),
    trendDataMonthly: dataAnalysis.getTrendsByGranularity(filteredData, "monthly"),
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
    anniversaryData: dataAnalysis.getAnniversarySalesCorrelation(filteredData, memberData, 30),
    colorTrends: dataAnalysis.getAttributeTrends(filteredData, "color", "monthly"),
    materialTrends: dataAnalysis.getAttributeTrends(filteredData, "material", "monthly"),
    customerSegments: dataAnalysis.getCustomerSegments(filteredData),
    dayOfWeekData: dataAnalysis.getDayOfWeekAnalysis(filteredData),
    productTrendsDaily: dataAnalysis.getProductTrends(filteredData, 25, "daily"),
    productTrendsWeekly: dataAnalysis.getProductTrends(filteredData, 25, "weekly"),
    productTrendsMonthly: dataAnalysis.getProductTrends(filteredData, 25, "monthly"),
    collectionTrendsDaily: dataAnalysis.getCollectionTrends(filteredData, 25, "daily"),
    collectionTrendsWeekly: dataAnalysis.getCollectionTrends(filteredData, 25, "weekly"),
    collectionTrendsMonthly: dataAnalysis.getCollectionTrends(filteredData, 25, "monthly"),
    categoryTrendsWeekly: dataAnalysis.getCategoryTrends(filteredData, 25, "weekly"),
    categoryTrendsMonthly: dataAnalysis.getCategoryTrends(filteredData, 25, "monthly"),
    productPerformanceWithStores: dataAnalysis.getProductPerformanceWithStores(filteredData, 25),
    collectionPerformanceWithStores: dataAnalysis.getCollectionPerformanceWithStores(
      filteredData,
      25
    ),
    categoryPerformanceWithStores: dataAnalysis.getCategoryPerformanceWithStores(filteredData, 25),
    colorPerformanceWithStores: dataAnalysis.getColorPerformanceWithStores(filteredData, 25),
    materialPerformanceWithStores: dataAnalysis.getMaterialPerformanceWithStores(filteredData, 25),
    storePerformanceWithProducts: dataAnalysis.getStorePerformanceWithProducts(filteredData, 25),
    storeTrendsDaily: dataAnalysis.getStoreTrends(filteredData, 25, "daily"),
    storeTrendsWeekly: dataAnalysis.getStoreTrends(filteredData, 25, "weekly"),
    storeTrendsMonthly: dataAnalysis.getStoreTrends(filteredData, 25, "monthly"),
    rfmSegments: dataAnalysis.getRFMSegments(filteredData),
    rfmMatrix: dataAnalysis.getRFMMatrix(filteredData),
    frequencySegments: dataAnalysis.getFrequencySegments(filteredData),
    ageSegments: dataAnalysis.getAgeSegments(filteredData, memberData),
    genderSegments: dataAnalysis.getGenderSegments(filteredData, memberData),
    channelSegments: dataAnalysis.getChannelSegments(filteredData),
    aovSegments: dataAnalysis.getAOVSegments(filteredData),
    employeePerformance: dataAnalysis.getEmployeePerformance(filteredData),
  };

  if (storeCustomerRanks && storeCustomerRanks.length > 0) {
    precomputed.storeCustomerRanks = storeCustomerRanks;
  }

  const publicDir = join(__dirname, "..", "public", "data");
  const outputPath = join(publicDir, "precomputed.json");
  console.log("💾 Writing precomputed data to", outputPath);
  writeFileSync(outputPath, JSON.stringify(precomputed, null, 2), "utf-8");

  console.log("✅ Data precomputation complete!");
  console.log(`📊 Precomputed ${Object.keys(precomputed).length} analysis results`);
}

precomputeData()
  .then(() => {})
  .catch((error) => {
    console.error("❌ Error during precomputation:", error);
    process.exit(1);
  });

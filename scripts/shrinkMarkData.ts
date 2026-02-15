/**
 * Shrinks Mark CSV data to a subset of members for faster local dev.
 *
 * 1. Replaces mark_membership.csv with only the first N members (default 5000).
 * 2. Filters mark_sales_202602131852.csv to rows whose 会員ID is in that set.
 * 3. Filters mark_store_customer_ranks.csv to rows whose 会員ID is in that set.
 *
 * Usage: npx tsx scripts/shrinkMarkData.ts [N]
 * Example: npx tsx scripts/shrinkMarkData.ts 5000
 */

import { createReadStream, writeFileSync, renameSync } from "fs";
import Papa from "papaparse";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MEMBER_LIMIT = parseInt(process.argv[2] ?? "5000", 10) || 5000;
const srcDataDir = join(__dirname, "..", "src", "data");
const memberCsvPath = join(srcDataDir, "mark_membership.csv");
const salesCsvPath = join(srcDataDir, "mark_sales_202602131852.csv");
const ranksCsvPath = join(srcDataDir, "mark_store_customer_ranks.csv");

const MEMBER_ID_KEY = "会員ID";

type RawCsvRow = Record<string, string>;

function trimId(value: unknown): string {
  return String(value ?? "").trim();
}

/**
 * Stream membership CSV, collect first MEMBER_LIMIT data rows, return
 * { rows, memberIdSet }. Stops the stream after limit is reached.
 */
function streamMembershipFirstN(
  path: string,
  limit: number
): Promise<{ rows: RawCsvRow[]; memberIdSet: Set<string> }> {
  return new Promise((resolve, reject) => {
    const rows: RawCsvRow[] = [];
    const memberIdSet = new Set<string>();
    const stream = createReadStream(path, { encoding: "utf-8" }).pipe(
      Papa.parse(Papa.NODE_STREAM_INPUT, { header: true, skipEmptyLines: true })
    );
    stream.on("data", (row: RawCsvRow) => {
      if (rows.length >= limit) return;
      const id = trimId(row[MEMBER_ID_KEY]);
      if (id) memberIdSet.add(id);
      rows.push(row);
    });
    stream.on("end", () => resolve({ rows, memberIdSet }));
    stream.on("error", reject);
  });
}

/**
 * Stream a CSV file and return only rows whose 会員ID is in memberIdSet.
 * Keeps memory low for large files.
 */
function streamFilterCsvByMemberId(
  path: string,
  memberIdSet: Set<string>
): Promise<RawCsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: RawCsvRow[] = [];
    const stream = createReadStream(path, { encoding: "utf-8" }).pipe(
      Papa.parse(Papa.NODE_STREAM_INPUT, { header: true, skipEmptyLines: true })
    );
    stream.on("data", (row: RawCsvRow) => {
      if (memberIdSet.has(trimId(row[MEMBER_ID_KEY]))) rows.push(row);
    });
    stream.on("end", () => resolve(rows));
    stream.on("error", reject);
  });
}

function writeCsv(path: string, rows: RawCsvRow[]): void {
  if (rows.length === 0) {
    writeFileSync(path, "", "utf-8");
    return;
  }
  const csv = Papa.unparse(rows);
  writeFileSync(path, csv, "utf-8");
}

async function main() {
  console.log(`📉 Shrinking Mark data to first ${MEMBER_LIMIT} members...`);

  // 1. Stream membership, keep first N rows and build memberId set
  console.log("📖 Streaming membership CSV...");
  const { rows: memberRows, memberIdSet } = await streamMembershipFirstN(
    memberCsvPath,
    MEMBER_LIMIT
  );
  console.log(`   Collected ${memberRows.length} member rows, ${memberIdSet.size} unique 会員ID`);

  const memberTemp = join(srcDataDir, "mark_membership.csv.tmp");
  writeCsv(memberTemp, memberRows);
  renameSync(memberTemp, memberCsvPath);
  console.log(`   ✅ Wrote ${memberCsvPath} (${memberRows.length} rows)`);

  // 2. Filter sales: stream and keep only rows where 会員ID is in memberIdSet
  console.log("📖 Streaming sales CSV (filtering by 会員ID)...");
  const salesFiltered = await streamFilterCsvByMemberId(salesCsvPath, memberIdSet);
  const salesTemp = join(srcDataDir, "mark_sales_202602131852.csv.tmp");
  writeCsv(salesTemp, salesFiltered);
  renameSync(salesTemp, salesCsvPath);
  console.log(`   ✅ Wrote ${salesCsvPath} (${salesFiltered.length} rows)`);

  // 3. Filter store_customer_ranks: stream and keep only rows where 会員ID is in memberIdSet
  console.log("📖 Streaming store-customer-ranks CSV (filtering by 会員ID)...");
  const ranksFiltered = await streamFilterCsvByMemberId(ranksCsvPath, memberIdSet);
  const ranksTemp = join(srcDataDir, "mark_store_customer_ranks.csv.tmp");
  writeCsv(ranksTemp, ranksFiltered);
  renameSync(ranksTemp, ranksCsvPath);
  console.log(`   ✅ Wrote ${ranksCsvPath} (${ranksFiltered.length} rows)`);

  console.log("✅ Shrink complete. Run npm run precompute to regenerate precomputed.json.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});

/**
 * Tests CSV mappers: both Jouete and Mark convert to the common data model,
 * and Mark output contains no "jouete" (case-insensitive) anywhere.
 * Run: npx tsx scripts/testMappers.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Papa from "papaparse";

import type { SalesRecord, MemberRecord } from "../src/types";
import {
  mapJoueteSalesRow,
  mapJoueteMemberRow,
  mapMarkSalesRow,
  mapMarkMemberRow,
  mapMarkStoreCustomerRankRow,
} from "../src/utils/csvMappers";

const __dirname = dirname(fileURLToPath(import.meta.url));

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function hasJoueteAnywhere(obj: unknown): boolean {
  if (obj === null || obj === undefined) return false;
  if (typeof obj === "string") return /jouete/i.test(obj);
  if (typeof obj === "number" || typeof obj === "boolean") return false;
  if (Array.isArray(obj)) return obj.some((x) => hasJoueteAnywhere(x));
  if (typeof obj === "object") {
    return Object.values(obj).some((v) => hasJoueteAnywhere(v));
  }
  return false;
}

function runJoueteTests(): void {
  console.log("Testing Jouete mappers...");
  const publicDir = join(__dirname, "..", "public", "data");
  let salesCsv: string;
  let memberCsv: string;
  try {
    salesCsv = readFileSync(join(publicDir, "sales_jouete_1y.csv"), "utf-8");
    memberCsv = readFileSync(join(publicDir, "member_jouete.csv"), "utf-8");
  } catch (e) {
    console.log("  ⏭ Skipping Jouete tests (CSV files not found in public/data)");
    return;
  }

  const salesLines = salesCsv.split("\n").slice(1).join("\n");
  const salesRows = Papa.parse<Record<string, string>>(salesLines, {
    header: true,
    skipEmptyLines: true,
  }).data;
  const memberRows = Papa.parse<Record<string, string>>(memberCsv, {
    header: true,
    skipEmptyLines: true,
  }).data;

  const salesRecords: SalesRecord[] = salesRows
    .slice(0, 5)
    .map((row) => mapJoueteSalesRow(row));
  const memberRecords: MemberRecord[] = memberRows
    .slice(0, 5)
    .map((row) => mapJoueteMemberRow(row));

  assert(salesRecords.length > 0, "Jouete sales: expected at least one record");
  assert(memberRecords.length > 0, "Jouete members: expected at least one record");

  const firstSales = salesRecords[0];
  assert(typeof firstSales.memberId === "string", "Jouete sales: memberId string");
  assert(typeof firstSales.purchaseDate === "string", "Jouete sales: purchaseDate string");
  assert(typeof firstSales.amount === "number", "Jouete sales: amount number");
  assert(firstSales.transactionType !== undefined, "Jouete sales: transactionType present");

  const firstMember = memberRecords[0];
  assert(typeof firstMember.memberId === "string", "Jouete members: memberId string");
  assert(
    firstMember.birthDate === null || typeof firstMember.birthDate === "string",
    "Jouete members: birthDate string or null"
  );

  console.log("  ✅ Jouete mappers: shape OK");
}

// Inline Mark CSV fixtures (real files are too large to read in test)
const MARK_SALES_CSV_FIXTURE = `"会員ID","購買日","品番","商品名","カラーコード","カラー名","サイズコード","サイズ名","店舗ブランドコード","店舗ブランド略称","商品ブランドコード","商品ブランド略称","購買点数","税抜金額","VS店舗ID","店舗名","MS店舗ID","販売担当者","担当者コード","売上ID","標準小売単価"
"RC01862444","2023-01-01","002250801501","チュール刺繍フレアスカート","03","IVY","004","M","00","MD","00","MD",1,8640,"0000316","FC金沢フォーラス","0032602","MD FC金沢フォーラス","060316","004424027440000100001",16000
"RC01866206","2023-01-01","002240400501","2WAYリボンブラウス","12","B.PNK","099","F","00","MD","00","MD",1,3600,"0000316","FC金沢フォーラス","0032602","MD FC金沢フォーラス","060316","004424029850000100001",9500`;

const MARK_MEMBER_CSV_FIXTURE = `"更新日時","登録日時","更新者","登録者","有効フラグ","会員ID","都道府県","市区町村","生年月日","性別","DM受取","メルマガ登録","媒体コード","初回登録店舗"
"2016-11-01 01:38:57.0","2014-07-04 03:35:55.0","BRANDEX_BATCH","BRANDEX_BATCH","1","RC0422567","東京都","渋谷区恵比寿","1966-02-16","2",,,"RCW",
"2016-11-01 01:38:57.0","2014-07-04 03:58:49.0","BRANDEX_BATCH","BRANDEX_BATCH","1","RC0422754","東京都","目黒区","1986-03-13","2",,,"RCW","MD 心斎橋"`;

const MARK_RANKS_CSV_FIXTURE = `"ID","会員ID","更新日時","登録日時","ブランドCD","店舗CD","店舗ID","店舗名","担当者コード","担当者名","顧客ランク"
1,"RC00000241","2026-02-01 07:44:52.0","2021-03-30 10:55:43.0","00","0060302","0000007","MERCURYDUO 心斎橋OPA","006795","尾野 成美",
2,"RC00000451","2026-02-01 07:44:52.0","2021-03-30 10:55:43.0","00","0060205","0000017","MERCURYDUO 広島パルコ","001149","松永 香奈","Cランク"`;

function runMarkTests(): void {
  console.log("Testing Mark mappers...");
  const salesCsv = MARK_SALES_CSV_FIXTURE;
  const memberCsv = MARK_MEMBER_CSV_FIXTURE;
  const ranksCsv = MARK_RANKS_CSV_FIXTURE;

  const salesRows = Papa.parse<Record<string, string>>(salesCsv, {
    header: true,
    skipEmptyLines: true,
  }).data;
  const memberRows = Papa.parse<Record<string, string>>(memberCsv, {
    header: true,
    skipEmptyLines: true,
  }).data;
  const rankRows = Papa.parse<Record<string, string>>(ranksCsv, {
    header: true,
    skipEmptyLines: true,
  }).data;

  const salesRecords: SalesRecord[] = salesRows
    .slice(0, 20)
    .map((row) => mapMarkSalesRow(row));
  const memberRecords: MemberRecord[] = memberRows
    .slice(0, 20)
    .map((row) => mapMarkMemberRow(row));
  const rankRecords = rankRows.slice(0, 10).map((row) => mapMarkStoreCustomerRankRow(row));

  assert(salesRecords.length > 0, "Mark sales: expected at least one record");
  assert(memberRecords.length > 0, "Mark members: expected at least one record");

  for (const r of salesRecords) {
    assert(!hasJoueteAnywhere(r), "Mark sales: no 'jouete' in record");
  }
  for (const r of memberRecords) {
    assert(!hasJoueteAnywhere(r), "Mark members: no 'jouete' in record");
  }
  for (const r of rankRecords) {
    assert(!hasJoueteAnywhere(r), "Mark store ranks: no 'jouete' in record");
  }

  const firstSales = salesRecords[0];
  assert(firstSales.transactionType === "売上", "Mark sales: transactionType is 売上");
  assert(typeof firstSales.memberId === "string", "Mark sales: memberId string");
  assert(typeof firstSales.amount === "number", "Mark sales: amount number");
  assert(firstSales.collectionCode === "", "Mark sales: collectionCode empty");
  assert(firstSales.productCategoryCode === "", "Mark sales: productCategoryCode empty");
  assert(firstSales.materialCode === "", "Mark sales: materialCode empty");

  const firstMember = memberRecords[0];
  assert(typeof firstMember.memberId === "string", "Mark members: memberId string");
  assert(firstMember.favoriteStore === null, "Mark members: favoriteStore null");
  assert(firstMember.importantPersonBirthday === null, "Mark members: importantPersonBirthday null");
  assert(firstMember.anniversary === null, "Mark members: anniversary null");

  const firstRank = rankRecords[0];
  assert(typeof firstRank.memberId === "string", "Mark ranks: memberId string");
  assert(typeof firstRank.storeName === "string", "Mark ranks: storeName string");

  console.log("  ✅ Mark mappers: shape OK, no Jouete in output");
}

function main(): void {
  console.log("Running mapper tests...\n");
  runJoueteTests();
  runMarkTests();
  console.log("\n✅ All mapper tests passed.");
}

main();

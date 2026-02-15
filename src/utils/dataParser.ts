import Papa from "papaparse";
import type { DataSourceId } from "./csvMappers";
import {
  mapJoueteSalesRow,
  mapJoueteMemberRow,
  mapMarkSalesRow,
  mapMarkMemberRow,
} from "./csvMappers";
import type { SalesRecord, MemberRecord } from "../types";

type RawRow = Record<string, string | undefined>;

/**
 * Parses sales CSV text into the common SalesRecord[] model.
 * @param csvText - Raw CSV string (with header row)
 * @param dataSource - Which export format: "jouete" (default) or "mark"
 */
export function parseSalesCSV(
  csvText: string,
  dataSource: DataSourceId = "jouete"
): SalesRecord[] {
  const lines = csvText.split("\n");
  const csvContent =
    dataSource === "jouete" ? lines.slice(1).join("\n") : lines.join("\n");
  const results = Papa.parse<RawRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });
  const mapper = dataSource === "jouete" ? mapJoueteSalesRow : mapMarkSalesRow;
  return results.data
    .map((row) => mapper(row))
    .filter((r) => r.memberId && r.purchaseDate);
}

/**
 * Parses member CSV text into the common MemberRecord[] model.
 * @param csvText - Raw CSV string (with header row)
 * @param dataSource - Which export format: "jouete" (default) or "mark"
 */
export function parseMemberCSV(
  csvText: string,
  dataSource: DataSourceId = "jouete"
): MemberRecord[] {
  const results = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  const mapper = dataSource === "jouete" ? mapJoueteMemberRow : mapMarkMemberRow;
  return results.data.map((row) => mapper(row)).filter((r) => r.memberId);
}

/**
 * Loads sales CSV from public/data. Uses Jouete file path; for Mark use precomputed data.
 */
export async function loadSalesData(
  dataSource: DataSourceId = "jouete"
): Promise<SalesRecord[]> {
  const baseUrl = import.meta.env.BASE_URL;
  const fileName =
    dataSource === "mark" ? "mark_sales_202602131852.csv" : "sales_jouete_1y.csv";
  const response = await fetch(`${baseUrl}data/${fileName}`);
  if (!response.ok) {
    throw new Error(`Failed to load sales data: ${response.statusText}`);
  }
  const csvText = await response.text();
  return parseSalesCSV(csvText, dataSource);
}

/**
 * Loads member CSV from public/data. Uses Jouete file path; for Mark use precomputed data.
 */
export async function loadMemberData(
  dataSource: DataSourceId = "jouete"
): Promise<MemberRecord[]> {
  const baseUrl = import.meta.env.BASE_URL;
  const fileName =
    dataSource === "mark" ? "mark_membership.csv" : "member_jouete.csv";
  const response = await fetch(`${baseUrl}data/${fileName}`);
  if (!response.ok) {
    throw new Error(`Failed to load member data: ${response.statusText}`);
  }
  const csvText = await response.text();
  return parseMemberCSV(csvText, dataSource);
}

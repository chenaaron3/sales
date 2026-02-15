import type { SalesRecord, MemberRecord, StoreCustomerRankRecord } from "../../types";
import type { RawCsvRow } from "./joueteMappers";

/** Sales-only data: every row is a sale. Use fixed transactionType. */
const SALE_TRANSACTION_TYPE = "売上";

/**
 * Maps one row from the Mark sales CSV to the common SalesRecord model.
 * No product- or brand-specific names; column names match Mark export.
 */
export function mapMarkSalesRow(row: RawCsvRow): SalesRecord {
  const quantity = parseFloat(String(row["購買点数"] ?? "0").replace(/,/g, "")) || 0;
  const amount = parseFloat(String(row["税抜金額"] ?? "0").replace(/,/g, "")) || 0;
  const unitPrice = quantity ? amount / quantity : parseFloat(String(row["標準小売単価"] ?? "0").replace(/,/g, "")) || 0;
  return {
    recordUpdateDate: "",
    recordAddDate: "",
    memberId: String(row["会員ID"] ?? "").trim(),
    transactionNumber: row["売上ID"] ?? "",
    purchaseDate: String(row["購買日"] ?? "").trim(),
    cardNumber: "",
    productCode: String(row["品番"] ?? "").trim(),
    productName: String(row["商品名"] ?? "").trim(),
    quantity,
    unitPrice,
    amount,
    storeCode: String(row["VS店舗ID"] ?? row["MS店舗ID"] ?? "").trim(),
    storeName: String(row["店舗名"] ?? "").trim(),
    staffCode: String(row["担当者コード"] ?? "").trim(),
    staffName: String(row["販売担当者"] ?? "").trim(),
    brand: row["店舗ブランド略称"] ?? row["商品ブランド略称"] ?? "",
    collectionCode: "",
    collectionName: "",
    productCategoryCode: "",
    productCategoryName: "",
    itemCode: "",
    itemName: "",
    materialCode: "",
    materialName: "",
    colorCode: String(row["カラーコード"] ?? "").trim(),
    colorName: String(row["カラー名"] ?? "").trim(),
    transactionType: SALE_TRANSACTION_TYPE,
  };
}

/**
 * Maps one row from the Mark membership CSV to the common MemberRecord model.
 * Newsletter/DM columns have different semantics (登録/受取) but map to same flags.
 */
export function mapMarkMemberRow(row: RawCsvRow): MemberRecord {
  const birth = row["生年月日"];
  return {
    memberId: String(row["会員ID"] ?? "").trim(),
    birthDate: birth != null && String(birth).trim() !== "" ? String(birth).trim() : null,
    gender: row["性別"] != null && String(row["性別"]).trim() !== "" ? String(row["性別"]).trim() : null,
    newsletterFlag: row["メルマガ登録"] ?? "",
    dmFlag: row["DM受取"] ?? "",
    favoriteStore: null,
    importantPersonBirthday: null,
    anniversary: null,
    firstRegisteredStore: row["初回登録店舗"] != null && String(row["初回登録店舗"]).trim() !== "" ? String(row["初回登録店舗"]).trim() : null,
  };
}

/**
 * Maps one row from the Mark store-customer-ranks CSV to StoreCustomerRankRecord.
 * Only present for Mark data source.
 */
export function mapMarkStoreCustomerRankRow(row: RawCsvRow): StoreCustomerRankRecord {
  const rank = row["顧客ランク"];
  return {
    id: String(row["ID"] ?? "").trim(),
    memberId: String(row["会員ID"] ?? "").trim(),
    storeId: String(row["店舗ID"] ?? "").trim(),
    storeName: String(row["店舗名"] ?? "").trim(),
    staffCode: String(row["担当者コード"] ?? "").trim(),
    staffName: String(row["担当者名"] ?? "").trim(),
    customerRank: rank != null && String(rank).trim() !== "" ? String(rank).trim() : null,
  };
}

import type { SalesRecord, MemberRecord } from "../../types";

/** Raw CSV row (header keys may be in Japanese or other source-specific names). */
export type RawCsvRow = Record<string, string | undefined>;

/**
 * Maps one row from the Jouete sales CSV to the common SalesRecord model.
 * Column names are specific to the Jouete export format.
 */
export function mapJoueteSalesRow(row: RawCsvRow): SalesRecord {
  const quantity = parseFloat(row["数量"] ?? "0") || 0;
  const amount = parseFloat(row["金額"] ?? "0") || 0;
  return {
    recordUpdateDate: row["レコード更新日時"] ?? "",
    recordAddDate: row["レコード追加日時"] ?? "",
    memberId: row["jouete会員番号"] ?? "",
    transactionNumber: row["取引通番"] ?? "",
    purchaseDate: row["購入日付"] ?? "",
    cardNumber: row["カード番号"] ?? "",
    productCode: row["商品コード"] ?? "",
    productName: row["商品名"] ?? "",
    quantity,
    unitPrice: quantity ? amount / quantity : 0,
    amount,
    storeCode: row["店舗コード"] ?? "",
    storeName: row["店舗名"] ?? "",
    staffCode: row["担当者コード"] ?? "",
    staffName: row["担当者名"] ?? "",
    brand: row["ブランド"] ?? "",
    collectionCode: row["コレクションコード"] ?? "",
    collectionName: row["コレクション名"] ?? "",
    productCategoryCode: row["商品分類"] ?? "",
    productCategoryName: row["商品分類名"] ?? "",
    itemCode: row["アイテムコード"] ?? "",
    itemName: row["アイテム名"] ?? "",
    materialCode: row["素材コード"] ?? "",
    materialName: row["素材名"] ?? "",
    colorCode: row["カラーコード"] ?? "",
    colorName: row["カラー名"] ?? "",
    transactionType: row["取引名"] ?? "",
  };
}

/**
 * Maps one row from the Jouete member CSV to the common MemberRecord model.
 */
export function mapJoueteMemberRow(row: RawCsvRow): MemberRecord {
  return {
    memberId: row["jouete会員番号"] ?? "",
    birthDate: row["生年月日"] ?? null,
    gender: row["性別"] ?? null,
    newsletterFlag: row["メルマガ希望フラグ"] ?? "",
    dmFlag: row["DM送付希望フラグ"] ?? "",
    favoriteStore: row["お気に入り店舗"] ?? null,
    importantPersonBirthday: row["大事な方のお誕生日"] ?? null,
    anniversary: row["記念日"] ?? null,
    firstRegisteredStore: row["初回登録店舗"] ?? null,
  };
}

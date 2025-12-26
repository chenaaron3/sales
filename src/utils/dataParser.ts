import Papa from 'papaparse';

export function parseSalesCSV(csvText: string): any[] {
  // Skip the first line (it's just "sales_jouete_1y")
  const lines = csvText.split("\n");
  const csvWithoutFirstLine = lines.slice(1).join("\n");

  const results = Papa.parse(csvWithoutFirstLine, {
    header: true,
    skipEmptyLines: true,
  });

  // Transform Japanese headers to English property names
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

  return transformed;
}

export function parseMemberCSV(csvText: string): any[] {
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

  return transformed;
}

export async function loadSalesData(): Promise<any[]> {
  // Fetch from public directory - use BASE_URL to respect Vite base path
  const baseUrl = import.meta.env.BASE_URL;
  const response = await fetch(`${baseUrl}data/sales_jouete_1y.csv`);
  if (!response.ok) {
    throw new Error(`Failed to load sales data: ${response.statusText}`);
  }
  const csvText = await response.text();
  return parseSalesCSV(csvText);
}

export async function loadMemberData(): Promise<any[]> {
  // Fetch from public directory - use BASE_URL to respect Vite base path
  const baseUrl = import.meta.env.BASE_URL;
  const response = await fetch(`${baseUrl}data/member_jouete.csv`);
  if (!response.ok) {
    throw new Error(`Failed to load member data: ${response.statusText}`);
  }
  const csvText = await response.text();
  return parseMemberCSV(csvText);
}

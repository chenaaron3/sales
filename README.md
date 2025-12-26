# Sales Dashboard - Customer Behavior Analysis

A comprehensive React-based dashboard for analyzing customer behavior and sales data from an online jewelry store (Jouete). This dashboard provides deep insights into customer buying patterns, product performance, store operations, and segmentation strategies to help increase sales.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Data Structure](#data-structure)
- [Dashboard Components](#dashboard-components)
- [Analysis Capabilities](#analysis-capabilities)
- [Project Structure](#project-structure)
- [Usage](#usage)

## 🎯 Overview

This dashboard is designed to answer key business questions:

- **Customer Behavior**: How do customers buy? What patterns can we identify?
- **Product Performance**: Which products drive revenue? What are the trends?
- **Store Performance**: How do different stores compare? Online vs brick-and-mortar?
- **Customer Segmentation**: How can we segment customers for targeted marketing?
- **Birthday Correlation**: Is there a correlation between birthdays and sales?
- **Temporal Patterns**: When do customers buy? What days are busiest?

## ✨ Features

### Core Dashboard

- **KPI Cards**: Total revenue, transactions, average order value, and active customers
- **Interactive Filters**: Date range, categories, and stores
- **Configurable Time Granularity**: Daily, 3-day, weekly, monthly, or quarterly views

### Sales Analysis

1. **Trend Analysis**: Revenue, transactions, and customer trends over time
2. **Category Sales**: Sales volume by product category over time with line charts
3. **Product Performance**: Top 10 products by revenue, quantity, or transaction count
4. **Store Performance**: Top 15 stores ranked by revenue with detailed metrics

### Customer Insights

1. **Advanced Customer Segmentation**: Multiple segmentation dimensions:

   - **RFM Analysis**: Recency, Frequency, Monetary segmentation (9 segments: Champions, Potential Loyalists, Loyal Customers, New Customers, At Risk, Cannot Lose Them, About to Sleep, Lost, Hibernating)
   - **Purchase Frequency**: Very Frequent (10+), Frequent (5-9), Regular (2-4), One-Time
   - **Recency**: Active (0-30 days), Recent (31-90), At Risk (91-180), Inactive (180+)
   - **Channel Preference**: Online Only, Mixed (Online & Store), Store Only
   - **Average Order Value (AOV)**: High (>¥15,000), Medium (¥8,000-15,000), Low (<¥8,000)
   - **Lifetime Value**: VIP (>¥100,000), High Value (¥50,000-100,000), Regular (¥20,000-50,000), Occasional (<¥20,000)

2. **Day of Week Analysis**: Sales patterns across different days with revenue, transactions, and customer metrics

### Product & Attribute Analysis

1. **Color/Material Trends**: Top 8 colors or materials over time with trend lines
2. **Product Attributes**: Track popularity of product attributes over time

### Special Features

1. **Birthday Correlation Heat Map**: Visualize the relationship between customer birthdays (or important person birthdays) and sales
   - Toggle between customer's own birthday and important person's birthday
   - View by sales count, revenue, or transactions
   - Color gradient from blue (cold/low sales) to red (hot/high sales)
   - Analyzes sales within ±30 days of birthdays

## 🛠 Technologies

- **React 19**: Frontend framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **Tailwind CSS 4**: Utility-first CSS framework
- **Recharts**: React charting library for data visualization
- **PapaParse**: Client-side CSV parsing

## 📦 Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Ensure data files are in place**:

   - `public/data/sales_jouete_1y.csv` - Sales transaction data
   - `public/data/member_jouete.csv` - Customer/member data

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser** to the URL shown in the terminal (typically `http://localhost:5173`)

6. **Build for production**:
   ```bash
   npm run build
   ```

## 📊 Data Structure

### Sales Data (`sales_jouete_1y.csv`)

Contains one year of sales transaction data with the following key fields:

- `jouete会員番号` (Member ID)
- `購入日付` (Purchase Date)
- `取引通番` (Transaction Number)
- `商品名` (Product Name)
- `商品コード` (Product Code)
- `数量` (Quantity)
- `金額` (Amount)
- `店舗名` (Store Name)
- `店舗コード` (Store Code)
- `商品分類名` (Product Category Name)
- `アイテム名` (Item Name) - e.g., リング (Ring), ネックレス (Necklace)
- `素材名` (Material Name)
- `カラー名` (Color Name)
- `取引名` (Transaction Type) - 売上 (Sale) or キャンセル (Cancel)

### Member Data (`member_jouete.csv`)

Contains customer/member information:

- `jouete会員番号` (Member ID)
- `生年月日` (Birth Date)
- `性別` (Gender)
- `重要人物の生年月日` (Important Person Birthday)
- `記念日` (Anniversary)
- `お気に入り店舗` (Favorite Store)
- `初回登録店舗` (First Registered Store)

**Note**: Data parsing automatically transforms Japanese headers to English property names.

## 🎨 Dashboard Components

### Main Components

- **`Dashboard.tsx`**: Main orchestrator component managing state and data flow
- **`Filters.tsx`**: Interactive filter controls for date range, categories, and stores
- **`KPIs.tsx`**: Displays key performance indicator cards

### Visualization Components

- **`TrendChart.tsx`**: Time series trends (revenue, transactions, customers)
- **`CategorySalesChart.tsx`**: Line chart showing sales by product category over time
- **`BirthdayHeatMap.tsx`**: Heat map visualization of birthday-sales correlation
- **`ProductPerformance.tsx`**: Horizontal bar chart of top products
- **`StorePerformance.tsx`**: Horizontal bar chart comparing store performance
- **`AttributeTrends.tsx`**: Line chart showing color/material trends over time
- **`AdvancedCustomerSegmentation.tsx`**: Comprehensive customer segmentation with multiple dimensions
- **`DayOfWeekAnalysis.tsx`**: Bar chart showing sales patterns by day of week

### Utility Components

- **`KPICard.tsx`**: Reusable KPI display card

## 📈 Analysis Capabilities

### Data Analysis Functions (`src/utils/dataAnalysis.ts`)

1. **KPIs**:

   - `calculateKPIs()`: Calculates total revenue, transactions, AOV, and active customers

2. **Time Series Analysis**:

   - `getTrendsByGranularity()`: Aggregates data by daily, 3-day, weekly, monthly, or quarterly periods
   - `getCategorySalesOverTime()`: Sales volume by category over time

3. **Product Analysis**:

   - `getTopProducts()`: Top products by revenue, quantity, or transactions
   - `getAttributeTrends()`: Trends for product attributes (color/material) over time

4. **Store Analysis**:

   - `getStorePerformance()`: Store comparison metrics (revenue, transactions, customers, AOV)

5. **Customer Segmentation**:

   - `getCustomerDetails()`: Comprehensive customer profile with purchase history
   - `getRFMSegments()`: RFM (Recency, Frequency, Monetary) analysis
   - `getFrequencySegments()`: Segments by purchase frequency
   - `getRecencySegments()`: Segments by days since last purchase
   - `getChannelSegments()`: Segments by shopping channel preference
   - `getAOVSegments()`: Segments by average order value
   - `getCustomerSegments()`: Segments by lifetime value

6. **Temporal Analysis**:

   - `getDayOfWeekAnalysis()`: Sales patterns by day of week

7. **Birthday Analysis**:

   - `getBirthdaySalesCorrelation()`: Analyzes sales correlation with birthdays
   - Handles year boundaries for accurate day-from-birthday calculations
   - Supports both customer's own birthday and important person's birthday

8. **Data Filtering**:
   - `filterSalesData()`: Filters sales data by date range, categories, and stores

### Data Parsing (`src/utils/dataParser.ts`)

- `parseSalesCSV()`: Parses sales CSV and transforms Japanese headers to English
- `loadSalesData()`: Loads sales data from public directory
- `loadMemberData()`: Loads member data from public directory
- Handles empty lines and validates required fields

## 📁 Project Structure

```
sales/
├── public/
│   └── data/
│       ├── sales_jouete_1y.csv      # Sales transaction data
│       └── member_jouete.csv        # Customer/member data
├── src/
│   ├── components/                  # React components
│   │   ├── AdvancedCustomerSegmentation.tsx
│   │   ├── AttributeTrends.tsx
│   │   ├── BirthdayHeatMap.tsx
│   │   ├── CategorySalesChart.tsx
│   │   ├── CustomerSegments.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DayOfWeekAnalysis.tsx
│   │   ├── Filters.tsx
│   │   ├── KPICard.tsx
│   │   ├── KPIs.tsx
│   │   ├── ProductPerformance.tsx
│   │   ├── StorePerformance.tsx
│   │   └── TrendChart.tsx
│   ├── utils/
│   │   ├── dataAnalysis.ts          # All analysis functions
│   │   └── dataParser.ts            # CSV parsing utilities
│   ├── types.ts                     # TypeScript type definitions
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global styles (Tailwind)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Usage

### Default Settings

- **Default Date Range**: Starts from Q3 2024 (July 1, 2024) due to data availability
- **Default Granularity**: Monthly
- **Default Birthday Type**: Important Person's Birthday

### Using Filters

1. **Date Range**: Select start and end dates to filter transactions
2. **Categories**: Multi-select product categories (e.g., リング, ネックレス)
3. **Stores**: Multi-select store locations
4. **Clear Filters**: Reset to default date range (Q3 2024)

### Changing Time Granularity

Use the granularity selector to view data at different time intervals:

- **Daily**: Day-by-day breakdown
- **3-Day**: 3-day aggregated periods
- **Weekly**: Weekly periods (ISO weeks)
- **Monthly**: Monthly aggregation
- **Quarterly**: Quarterly aggregation

### Customer Segmentation

The Advanced Customer Segmentation component allows you to switch between different segmentation dimensions:

1. Click on any segmentation type button
2. View pie chart for distribution
3. View bar chart for revenue comparison
4. Review detailed metrics in the segment cards below

### Birthday Heat Map

- Toggle between "Customer's Own Birthday" and "Important Person's Birthday"
- Switch metrics: Sales Count, Revenue, or Transactions
- Hover over cells to see exact values
- Colors indicate intensity: Blue (cold/low) → Red (hot/high)

### Product & Store Analysis

- **Product Performance**: Toggle between Revenue, Quantity, and Transactions metrics
- **Store Performance**: View top 15 stores with revenue, transactions, customers, and AOV
- **Attribute Trends**: Switch between Color and Material views

## 💡 Key Insights Provided

1. **Customer Lifetime Value**: Identify VIP customers and high-value segments
2. **At-Risk Customers**: Customers who haven't purchased recently but were valuable
3. **Product Winners**: Top-performing products to focus marketing efforts
4. **Store Performance**: Identify best-performing locations and opportunities
5. **Temporal Patterns**: Understand when customers are most active
6. **Channel Preferences**: Optimize online vs. brick-and-mortar strategies
7. **Birthday Marketing**: Identify optimal timing for birthday promotions
8. **Product Trends**: Track popularity of colors and materials over time

## 🔧 Data Processing Notes

- Only transactions with `transactionType === "売上"` (sales) are counted
- Negative amounts are filtered out (refunds/cancellations)
- Store names are normalized (trimmed) to handle variations
- Date filtering respects the selected date range
- All monetary values are in Japanese Yen (¥)
- Number formatting uses Japanese locale (`ja-JP`)

## 📝 Notes

- The dashboard performs all analysis client-side
- Large datasets may take a moment to load and process
- CSV files should be placed in `public/data/` directory
- The application automatically skips the first line of sales CSV (header row)
- Member data is required for birthday correlation analysis

## 🎨 Styling

The dashboard uses Tailwind CSS with:

- Dark mode support
- Responsive grid layouts
- Consistent color scheme
- Interactive hover states
- Modern card-based design

## 📄 License

Private project - All rights reserved

---

**Built with ❤️ for understanding customer behavior and driving sales growth**
# sales

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { BreakdownPanel } from './BreakdownPanel';
import { SEGMENT_COLORS } from '../utils/chartColors';

import type { EmployeePerformance } from '../types';

interface EmployeePerformanceChartProps {
    data: EmployeePerformance[];
}

const PRODUCT_COLORS = SEGMENT_COLORS;

export function EmployeePerformanceChart({ data }: EmployeePerformanceChartProps) {
    const { t } = useTranslation();
    const [hoveredItem, setHoveredItem] = useState<EmployeePerformance | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">{t('charts.noDataAvailable')}</p>
            </div>
        );
    }

    // Process each employee: get top 10 products, group rest as "Others"
    const processedData = data
        .filter((item) => item && item.staffName && item.products && Array.isArray(item.products))
        .map((item) => {
            // Sort products by revenue and get top 10
            const sortedProducts = [...item.products]
                .filter((p) => p && p.productName && p.revenue)
                .sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

            const top10Products = sortedProducts.slice(0, 10);
            const remainingProducts = sortedProducts.slice(10);

            // Calculate "Others" revenue
            const othersRevenue = remainingProducts.reduce((sum, p) => sum + (p.revenue || 0), 0);

            // Create processed products list with "Others" if needed
            const processedProducts = [...top10Products];
            if (othersRevenue > 0) {
                processedProducts.push({
                    productName: t('charts.others'),
                    revenue: othersRevenue,
                });
            }

            return {
                ...item,
                processedProducts,
            };
        });

    // Get all unique products across all employees (including "Others")
    const allProducts = new Set<string>();
    processedData.forEach((item) => {
        if (item.processedProducts && Array.isArray(item.processedProducts)) {
            item.processedProducts.forEach((product) => {
                if (product && product.productName) {
                    allProducts.add(product.productName);
                }
            });
        }
    });
    const productList = Array.from(allProducts);

    // Prepare chart data with product breakdown
    const chartData = processedData.map((item) => {
        const entry: any = {
            name: item.staffName.length > 30 ? item.staffName.substring(0, 30) + '...' : item.staffName,
            fullName: item.staffName,
            totalRevenue: item.totalRevenue || 0,
            originalItem: {
                ...item,
                products: item.processedProducts,
            },
        };

        // Add product revenues
        productList.forEach((productName) => {
            const productData = item.processedProducts.find((p) => p && p.productName === productName);
            entry[productName] = productData ? (productData.revenue || 0) : 0;
        });

        return entry;
    });

    const handleCellMouseEnter = (entry: any) => {
        if (entry && entry.originalItem) {
            setHoveredItem(entry.originalItem);
        }
    };

    return (
        <div className="flex gap-6 -mx-6">
            <div className="flex-1 overflow-visible">
                <ResponsiveContainer width="100%" height={800}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: -170, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={180}
                            tick={(props: any) => {
                                const { x, y, payload } = props;
                                return (
                                    <g transform={`translate(${x},${y})`}>
                                        <text
                                            x={20}
                                            y={0}
                                            dy={3}
                                            textAnchor="start"
                                            fill="var(--color-foreground)"
                                            fontSize={14}
                                            fontWeight="bold"
                                        >
                                            {payload.value}
                                        </text>
                                    </g>
                                );
                            }}
                            angle={0}
                            axisLine={false}
                            tickLine={false}
                        />
                        {productList.map((productName, productIndex) => (
                            <Bar
                                key={productName}
                                dataKey={productName}
                                stackId="products"
                                fill={PRODUCT_COLORS[productIndex % PRODUCT_COLORS.length]}
                                onMouseEnter={handleCellMouseEnter}
                            >
                                {chartData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={PRODUCT_COLORS[productIndex % PRODUCT_COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <BreakdownPanel
                title={hoveredItem?.staffName || ''}
                totalRevenue={hoveredItem?.totalRevenue || 0}
                items={hoveredItem?.products.map((p) => ({ name: p.productName, revenue: p.revenue })) || []}
                itemColors={PRODUCT_COLORS}
                itemList={productList}
                emptyMessage={{
                    primary: t('performance.hoverOverBar'),
                    secondary: t('performance.toSeeBreakdown', { breakdownType: '商品' }),
                }}
                itemLabel={t('performance.products')}
            />
        </div>
    );
}


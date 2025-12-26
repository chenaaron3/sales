import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { BreakdownPanel } from './BreakdownPanel';

import type { PerformanceWithStoreBreakdown } from '../types';

interface StorePerformanceProps {
    data: PerformanceWithStoreBreakdown[];
}

const PRODUCT_COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
    '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'
];

export function StorePerformanceChart({ data }: StorePerformanceProps) {
    const { t } = useTranslation();
    const [hoveredItem, setHoveredItem] = useState<PerformanceWithStoreBreakdown | null>(null);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">{t('charts.noDataAvailable')}</p>
            </div>
        );
    }

    // Get all unique products across all stores
    const allProducts = new Set<string>();
    data.forEach((item) => {
        item.stores.forEach((store) => allProducts.add(store.storeName)); // storeName field contains product name
    });
    const productList = Array.from(allProducts);

    // Prepare chart data with product breakdown
    const top25 = data.slice(0, 25);
    const chartData = top25.map((item) => {
        const entry: any = {
            name: item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name,
            fullName: item.name,
            totalRevenue: item.totalRevenue,
            originalItem: item,
        };

        // Add product revenues
        productList.forEach((productName) => {
            const productData = item.stores.find((s) => s.storeName === productName);
            entry[productName] = productData ? productData.revenue : 0;
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
                                            fill="#000000"
                                            className="dark:fill-white"
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
                                name={productName}
                            >
                                {chartData.map((entry) => (
                                    <Cell
                                        key={`cell-${productName}-${entry.name}`}
                                        onMouseEnter={() => handleCellMouseEnter(entry)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <BreakdownPanel
                title={hoveredItem?.name || ''}
                totalRevenue={hoveredItem?.totalRevenue || 0}
                items={hoveredItem?.stores.map((s) => ({ name: s.storeName, revenue: s.revenue })) || []}
                itemColors={PRODUCT_COLORS}
                itemList={productList}
                emptyMessage={{
                    primary: t('performance.hoverOver', { type: t('header.tabs.stores') }),
                    secondary: t('performance.toSeeBreakdown', { breakdownType: '商品' }),
                }}
                itemLabel={t('performance.productBreakdown')}
            />
        </div>
    );
}

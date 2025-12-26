import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { BreakdownPanel } from './BreakdownPanel';

import type { PerformanceWithStoreBreakdown } from '../types';

interface ProductPerformanceProps {
    data: PerformanceWithStoreBreakdown[];
    viewType: 'product' | 'collection';
}

const STORE_COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
    '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'
];

export function ProductPerformanceChart({ data, viewType }: ProductPerformanceProps) {
    const { t } = useTranslation();
    const [hoveredItem, setHoveredItem] = useState<PerformanceWithStoreBreakdown | null>(null);

    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
                <p className="text-gray-500 dark:text-gray-400">{t('charts.noDataAvailable')}</p>
            </div>
        );
    }

    // Get all unique stores across all items
    const allStores = new Set<string>();
    data.forEach((item) => {
        item.stores.forEach((store) => allStores.add(store.storeName));
    });
    const storeList = Array.from(allStores);

    // Prepare chart data with store breakdown
    const top25 = data.slice(0, 25);
    const chartData = top25.map((item) => {
        const entry: any = {
            name: item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name,
            fullName: item.name,
            totalRevenue: item.totalRevenue,
            originalItem: item,
        };

        // Add store revenues
        storeList.forEach((storeName) => {
            const storeData = item.stores.find((s) => s.storeName === storeName);
            entry[storeName] = storeData ? storeData.revenue : 0;
        });

        return entry;
    });

    const handleCellMouseEnter = (entry: any) => {
        if (entry && entry.originalItem) {
            setHoveredItem(entry.originalItem);
        }
    };

    const typeLabel = viewType === 'product' ? t('product.types.product') : t('product.types.collection');

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
                        {storeList.map((storeName, storeIndex) => (
                            <Bar
                                key={storeName}
                                dataKey={storeName}
                                stackId="stores"
                                fill={STORE_COLORS[storeIndex % STORE_COLORS.length]}
                                name={storeName}
                            >
                                {chartData.map((entry) => (
                                    <Cell
                                        key={`cell-${storeName}-${entry.name}`}
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
                itemColors={STORE_COLORS}
                itemList={storeList}
                emptyMessage={{
                    primary: t('performance.hoverOver', { type: typeLabel }),
                    secondary: t('performance.toSeeBreakdown', { breakdownType: '店舗' }),
                }}
                itemLabel={t('performance.storeBreakdown')}
            />
        </div>
    );
}

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

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
    const [hoveredItem, setHoveredItem] = useState<PerformanceWithStoreBreakdown | null>(null);

    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
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
            <div className="w-80 shrink-0">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 sticky top-4">
                    {hoveredItem ? (
                        <>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {hoveredItem.name}
                            </h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Total Revenue: <span className="font-bold text-gray-900 dark:text-white">
                                    ¥{hoveredItem.totalRevenue.toLocaleString('ja-JP')}
                                </span>
                            </div>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Store Breakdown:
                                </div>
                                {[...hoveredItem.stores]
                                    .sort((a, b) => b.revenue - a.revenue)
                                    .map((store) => {
                                        const percentage = (store.revenue / hoveredItem.totalRevenue) * 100;
                                        const colorIndex = storeList.indexOf(store.storeName);
                                        return (
                                            <div
                                                key={store.storeName}
                                                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                <div
                                                    className="w-4 h-4 rounded shrink-0"
                                                    style={{
                                                        backgroundColor: STORE_COLORS[colorIndex % STORE_COLORS.length],
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {store.storeName}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        ¥{store.revenue.toLocaleString('ja-JP')} ({percentage.toFixed(1)}%)
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-[500px] text-gray-400 dark:text-gray-500">
                            <div className="text-center">
                                <p className="text-sm">Hover over a {viewType === 'product' ? 'product' : 'collection'} bar</p>
                                <p className="text-xs mt-1">to see store breakdown</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

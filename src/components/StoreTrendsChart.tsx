import {
    CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import type { StoreTrend } from '../types';

interface StoreTrendsChartProps {
    data: StoreTrend[];
}

const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
    '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'
];

export function StoreTrendsChart({ data }: StoreTrendsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
            </div>
        );
    }

    // Get all store names (excluding 'date')
    const storeNames = Object.keys(data[0]).filter(key => key !== 'date');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Top Stores Trends Over Time
            </h2>
            <ResponsiveContainer width="100%" height={500}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(value: number | undefined) => value !== undefined ? `¥${value.toLocaleString('ja-JP')}` : ''}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                        verticalAlign="bottom"
                        height={80}
                    />
                    {storeNames.map((storeName, index) => {
                        const displayName = storeName.length > 40
                            ? storeName.substring(0, 40) + '...'
                            : storeName;
                        return (
                            <Line
                                key={storeName}
                                type="monotone"
                                dataKey={storeName}
                                name={displayName}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}


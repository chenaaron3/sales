import {
    Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import type { StorePerformance } from '../types';

interface StorePerformanceProps {
    data: StorePerformance[];
}

export function StorePerformanceChart({ data }: StorePerformanceProps) {
    const top15 = data.slice(0, 15);

    const chartData = top15.map((store) => ({
        name: store.storeName.length > 25
            ? store.storeName.substring(0, 25) + '...'
            : store.storeName,
        fullName: store.storeName,
        revenue: store.revenue,
        transactions: store.transactions,
        customers: store.customers,
        aov: store.averageOrderValue,
    }));

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8'];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Store Performance Comparison (Top 15)
            </h2>
            <ResponsiveContainer width="100%" height={500}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `¥${(value / 1000000).toFixed(1)}M`} />
                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number | undefined, name: string | undefined) => {
                            if (value === undefined) return '';
                            if (name === 'revenue') return `¥${value.toLocaleString('ja-JP')}`;
                            if (name === 'aov') return `¥${value.toLocaleString('ja-JP')}`;
                            return value.toLocaleString('ja-JP');
                        }}
                        labelFormatter={(label) => {
                            const item = chartData.find(d => d.name === label);
                            return item?.fullName || label;
                        }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue">
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}


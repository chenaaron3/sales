import {
    Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import type { ProductPerformance } from '../types';

interface ProductPerformanceProps {
    data: ProductPerformance[];
    metric: 'revenue' | 'quantity' | 'transactions';
}

export function ProductPerformanceChart({ data, metric }: ProductPerformanceProps) {
    const top10 = data.slice(0, 10);

    const chartData = top10.map((product) => ({
        name: product.productName.length > 30
            ? product.productName.substring(0, 30) + '...'
            : product.productName,
        fullName: product.productName,
        revenue: product.revenue,
        quantity: product.quantity,
        transactions: product.transactions,
    }));

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8'];

    const metricLabels = {
        revenue: 'Revenue',
        quantity: 'Quantity',
        transactions: 'Transactions',
    };

    const formatValue = (value: number) => {
        if (metric === 'revenue') {
            return `¥${value.toLocaleString('ja-JP')}`;
        }
        return value.toLocaleString('ja-JP');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Top 10 Products Performance ({metricLabels[metric]})
            </h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatValue(value)} />
                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number | undefined) => value !== undefined ? formatValue(value) : ''}
                        labelFormatter={(label) => {
                            const item = chartData.find(d => d.name === label);
                            return item?.fullName || label;
                        }}
                    />
                    <Legend />
                    <Bar dataKey={metric} fill="#8884d8" name={metricLabels[metric]}>
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}


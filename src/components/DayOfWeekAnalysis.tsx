import {
    Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import type { DayOfWeekData } from '../types';

interface DayOfWeekAnalysisProps {
    data: DayOfWeekData[];
    metric: 'revenue' | 'transactions' | 'customers';
}

export function DayOfWeekAnalysisChart({ data, metric }: DayOfWeekAnalysisProps) {
    const metricLabels = {
        revenue: 'Revenue',
        transactions: 'Transactions',
        customers: 'Customers',
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
                Sales by Day of Week
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatValue(value) : ''} />
                    <Legend />
                    <Bar yAxisId="left" dataKey={metric} fill="#8884d8" name={metricLabels[metric]} />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="transactions"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Transactions"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}


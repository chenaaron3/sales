import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

import type { DayOfWeekData } from '../types';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, data }: any) => {
    if (active && payload && payload.length) {
        const revenue = payload[0].value as number;

        // Calculate percentile
        const revenues = data.map((d: DayOfWeekData) => d.revenue);
        const maxRevenue = Math.max(...revenues);
        const minRevenue = Math.min(...revenues);
        const percentile = maxRevenue === minRevenue
            ? 100
            : Math.round(((revenue - minRevenue) / (maxRevenue - minRevenue)) * 100);

        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
                <p className="text-sm text-gray-900 dark:text-white">
                    Revenue: <span className="font-semibold">¥{revenue.toLocaleString('ja-JP')}</span>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {percentile}th percentile
                </p>
            </div>
        );
    }
    return null;
};

interface DayOfWeekAnalysisProps {
    data: DayOfWeekData[];
    metric: 'revenue';
}

export function DayOfWeekAnalysisChart({ data, metric }: DayOfWeekAnalysisProps) {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>
                    Sales by Day of Week
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip data={data} />} />
                        <Bar dataKey={metric} fill="#8884d8" name="Revenue" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}


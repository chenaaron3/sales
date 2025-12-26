import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { Granularity } from '../utils/dataAnalysis';
import type { TimeSeriesData } from '../types';

interface TrendChartProps {
    data: TimeSeriesData[];
    granularity: Granularity;
}

const granularityLabels: Record<Granularity, string> = {
    daily: 'Daily',
    '3day': '3-Day',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
};

// Helper function to get week date range from W format (e.g., "2024-W27")
const getWeekDateRange = (weekLabel: string): { weekLabel: string; dateRange: string } => {
    const match = weekLabel.match(/^(\d{4})-W(\d+)$/);
    if (!match) return { weekLabel, dateRange: '' };

    const year = parseInt(match[1]);
    const weekNum = parseInt(match[2]);

    // Calculate start date: Jan 1 + (weekNum - 1) * 7 days
    const startOfYear = new Date(year, 0, 1);
    const startDate = new Date(startOfYear);
    startDate.setDate(startDate.getDate() + (weekNum - 1) * 7);

    // End date is 6 days later
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const formatDate = (date: Date) => {
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${m}-${d}`;
    };

    return {
        weekLabel,
        dateRange: `(${formatDate(startDate)} to ${formatDate(endDate)})`
    };
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, data, granularity }: any) => {
    if (active && payload && payload.length) {
        const revenue = payload[0].value as number;

        // Calculate percentile
        const revenues = data.map((d: TimeSeriesData) => d.revenue);
        const maxRevenue = Math.max(...revenues);
        const minRevenue = Math.min(...revenues);
        const percentile = maxRevenue === minRevenue
            ? 100
            : Math.round(((revenue - minRevenue) / (maxRevenue - minRevenue)) * 100);

        // Format label - add week date range for weekly granularity
        let displayLabel = label;
        let dateRange = '';
        if (granularity === 'weekly' && label.match(/^\d{4}-W\d+$/)) {
            const weekInfo = getWeekDateRange(label);
            displayLabel = weekInfo.weekLabel;
            dateRange = weekInfo.dateRange;
        }

        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{displayLabel}</p>
                {dateRange && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{dateRange}</p>
                )}
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

export function TrendChart({ data, granularity }: TrendChartProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {granularityLabels[granularity]} Sales Trends
            </h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip data={data} granularity={granularity} />} />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

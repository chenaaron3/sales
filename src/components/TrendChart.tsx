import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatCurrency } from '../utils/i18n';
import { SEGMENT_COLORS } from '../utils/chartColors';
import type { Granularity } from '../utils/dataAnalysis';
import type { TimeSeriesData } from '../types';

interface TrendChartProps {
    data: TimeSeriesData[];
    granularity: Granularity;
}


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

export function TrendChart({ data, granularity }: TrendChartProps) {
    const { t } = useTranslation();

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
                <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                    <p className="text-sm font-semibold text-card-foreground mb-1">{displayLabel}</p>
                    {dateRange && (
                        <p className="text-xs text-muted-foreground mb-2">{dateRange}</p>
                    )}
                    <p className="text-sm text-card-foreground">
                        {t('charts.revenue')}: <span className="font-semibold">{formatCurrency(revenue)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t('charts.percentile', { value: percentile })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
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
                <Tooltip content={(props) => <CustomTooltip {...props} data={data} granularity={granularity} t={t} />} />
                <Bar dataKey="revenue" fill={SEGMENT_COLORS[0]} name={t('charts.revenue')} />
            </BarChart>
        </ResponsiveContainer>
    );
}

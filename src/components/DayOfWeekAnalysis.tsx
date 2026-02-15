import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency } from '../utils/i18n';
import { SEGMENT_COLORS } from '../utils/chartColors';

import type { DayOfWeekData } from '../types';

interface DayOfWeekAnalysisProps {
    data: DayOfWeekData[];
    metric: 'revenue';
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, data, t }: any) => {
    if (active && payload && payload.length) {
        const revenue = payload[0].value as number;
        const displayLabel = DAY_TO_KEY[label] ? t(DAY_TO_KEY[label]) : label;

        // Calculate percentile
        const revenues = data.map((d: DayOfWeekData) => d.revenue);
        const maxRevenue = Math.max(...revenues);
        const minRevenue = Math.min(...revenues);
        const percentile = maxRevenue === minRevenue
            ? 100
            : Math.round(((revenue - minRevenue) / (maxRevenue - minRevenue)) * 100);

        return (
            <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                <p className="text-sm font-semibold text-card-foreground mb-1">{displayLabel}</p>
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

const DAY_TO_KEY: Record<string, string> = {
    Sun: 'temporal.days.sun',
    Mon: 'temporal.days.mon',
    Tue: 'temporal.days.tue',
    Wed: 'temporal.days.wed',
    Thu: 'temporal.days.thu',
    Fri: 'temporal.days.fri',
    Sat: 'temporal.days.sat',
};

export function DayOfWeekAnalysisChart({ data, metric }: DayOfWeekAnalysisProps) {
    const { t } = useTranslation();

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>
                    {t('temporal.dayOfWeek.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="overflow-visible">
                <ResponsiveContainer width="100%" height={300} className="min-h-0">
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="day"
                            tickFormatter={(value) => (DAY_TO_KEY[value] ? t(DAY_TO_KEY[value]) : value)}
                        />
                        <YAxis tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip data={data} t={t} />} />
                        <Bar dataKey={metric} fill={SEGMENT_COLORS[0]} name={t('charts.revenue')} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}


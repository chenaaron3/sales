import { useTranslation } from 'react-i18next';
import {
    CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import { formatCurrency } from '../utils/i18n';
import { SEGMENT_COLORS } from '../utils/chartColors';
import type { ProductTrend, CollectionTrend } from '../types';
import type { Granularity } from '../utils/dataAnalysis';

interface ProductTrendsChartProps {
    productData?: ProductTrend[];
    collectionData?: CollectionTrend[];
    viewType: 'product' | 'collection';
    granularity?: Granularity;
}

const COLORS = SEGMENT_COLORS;

export function ProductTrendsChart({ productData, collectionData, viewType }: ProductTrendsChartProps) {
    const { t } = useTranslation();
    const data = viewType === 'product' ? productData : collectionData;

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            // Sort payload by value in descending order
            const sortedPayload = [...payload].sort((a, b) => {
                const aValue = a.value as number || 0;
                const bValue = b.value as number || 0;
                return bValue - aValue;
            });

            return (
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
                    <div className="space-y-1">
                        {sortedPayload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-muted-foreground flex-1">
                                    {entry.name}:
                                </span>
                                <span className="text-sm font-semibold text-card-foreground">
                                    {formatCurrency(entry.value as number || 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">{t('charts.noDataAvailable')}</p>
            </div>
        );
    }

    // Get all item names (excluding 'date')
    const itemNames = Object.keys(data[0]).filter(key => key !== 'date');

    return (
        <ResponsiveContainer width="100%" height={500} className="min-h-0">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval="preserveStartEnd"
                />
                <YAxis
                    tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                {itemNames.map((itemName, index) => {
                    const displayName = itemName.length > 40
                        ? itemName.substring(0, 40) + '...'
                        : itemName;
                    return (
                        <Line
                            key={itemName}
                            type="monotone"
                            dataKey={itemName}
                            name={displayName}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                        />
                    );
                })}
            </LineChart>
        </ResponsiveContainer>
    );
}

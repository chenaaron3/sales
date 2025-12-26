import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatCurrency, formatNumber } from '../utils/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

import type { RFMMatrixCell } from '../types';

type MetricType = 'revenue' | 'aov' | 'customers';

interface RFMAnalysisProps {
    rfmMatrix: RFMMatrixCell[];
}

export function RFMAnalysis({ rfmMatrix }: RFMAnalysisProps) {
    const { t } = useTranslation();
    const [metricType, setMetricType] = useState<MetricType>('revenue');

    // Create a map for quick lookup
    const cellDataMap = new Map<string, RFMMatrixCell>();
    rfmMatrix.forEach((cell) => {
        const key = `${cell.rScore}-${cell.fScore}`;
        cellDataMap.set(key, cell);
    });

    // Extract ranges for R and F buckets
    const recencyRanges: { [key: number]: { min: number; max: number } } = {};
    const frequencyRanges: { [key: number]: { min: number; max: number } } = {};

    rfmMatrix.forEach((cell) => {
        if (cell.recencyRange) {
            recencyRanges[cell.rScore] = cell.recencyRange;
        }
        if (cell.frequencyRange) {
            frequencyRanges[cell.fScore] = cell.frequencyRange;
        }
    });

    // Get values for the selected metric
    const getMetricValue = (cell: RFMMatrixCell | undefined): number => {
        if (!cell || cell.count === 0) return 0;
        switch (metricType) {
            case 'revenue':
                return cell.totalRevenue;
            case 'aov':
                return cell.averageRevenue;
            case 'customers':
                return cell.count;
            default:
                return 0;
        }
    };

    const metricValues = rfmMatrix.map(cell => getMetricValue(cell)).filter(v => v > 0);
    const minValue = metricValues.length > 0 ? Math.min(...metricValues) : 0;
    const maxValue = metricValues.length > 0 ? Math.max(...metricValues) : 0;
    const valueRange = maxValue - minValue;

    // Helper to get color intensity based on selected metric
    // Green = good (high), Red = bad (low)
    const getColorIntensity = (value: number): string => {
        if (value === 0) return 'bg-gray-100 dark:bg-gray-800';

        // Normalize value to 0-1 range
        const intensity = valueRange > 0
            ? (value - minValue) / valueRange
            : 0.5;

        // Green (good) to Red (bad) color scale
        if (intensity >= 0.9) return 'bg-green-600 dark:bg-green-700';      // Very high (best)
        if (intensity >= 0.8) return 'bg-green-500 dark:bg-green-600';      // High
        if (intensity >= 0.7) return 'bg-green-400 dark:bg-green-500';       // Medium-high
        if (intensity >= 0.6) return 'bg-lime-400 dark:bg-lime-500';        // Medium-high
        if (intensity >= 0.5) return 'bg-yellow-400 dark:bg-yellow-500';     // Medium
        if (intensity >= 0.4) return 'bg-amber-400 dark:bg-amber-500';       // Medium-low
        if (intensity >= 0.3) return 'bg-orange-400 dark:bg-orange-500';     // Low-medium
        if (intensity >= 0.2) return 'bg-orange-500 dark:bg-orange-600';      // Low
        if (intensity >= 0.1) return 'bg-red-400 dark:bg-red-500';          // Very low
        return 'bg-red-500 dark:bg-red-600';                                  // Lowest (worst)
    };

    const getDisplayValue = (cell: RFMMatrixCell | undefined): string => {
        if (!cell || cell.count === 0) return t('common.noData');
        switch (metricType) {
            case 'revenue':
                return `¥${(cell.totalRevenue / 1000000).toFixed(1)}M`;
            case 'aov':
                return formatCurrency(cell.averageRevenue);
            case 'customers':
                return formatNumber(cell.count);
            default:
                return '';
        }
    };

    const getMetricDescription = (): string => {
        switch (metricType) {
            case 'revenue':
                return t('rfm.descriptions.revenue');
            case 'aov':
                return t('rfm.descriptions.aov');
            case 'customers':
                return t('rfm.descriptions.customers');
            default:
                return '';
        }
    };

    const getTooltipText = (cell: RFMMatrixCell | undefined): string => {
        if (!cell || cell.count === 0) return t('rfm.tooltips.noDataAvailable');

        const rLabel = [
            { value: 4, key: 'rfm.recency.mostRecent' },
            { value: 3, key: 'rfm.recency.recent' },
            { value: 2, key: 'rfm.recency.lessRecent' },
            { value: 1, key: 'rfm.recency.leastRecent' }
        ].find(r => r.value === cell.rScore)?.key || 'common.unknown';

        const fLabel = [
            { value: 4, key: 'rfm.frequency.high' },
            { value: 3, key: 'rfm.frequency.mediumHigh' },
            { value: 2, key: 'rfm.frequency.mediumLow' },
            { value: 1, key: 'rfm.frequency.low' }
        ].find(f => f.value === cell.fScore)?.key || 'common.unknown';

        const rLabelText = t(rLabel);
        const fLabelText = t(fLabel);

        switch (metricType) {
            case 'revenue':
                return String(t('rfm.tooltips.generatedRevenue', {
                    rLabel: rLabelText,
                    fLabel: fLabelText,
                    revenue: (cell.totalRevenue / 1000000).toFixed(1),
                    percentage: cell.percentage.toFixed(1)
                }));
            case 'aov':
                return String(t('rfm.tooltips.aovDescription', {
                    rLabel: rLabelText,
                    fLabel: fLabelText,
                    aov: formatCurrency(Math.round(cell.averageRevenue)),
                    revenue: (cell.totalRevenue / 1000000).toFixed(1),
                    count: formatNumber(cell.count)
                } as any));
            case 'customers':
                return String(t('rfm.tooltips.customerCount', {
                    rLabel: rLabelText,
                    fLabel: fLabelText,
                    count: formatNumber(cell.count),
                    percentage: cell.percentage.toFixed(1),
                    revenue: (cell.totalRevenue / 1000000).toFixed(1)
                } as any));
            default:
                return '';
        }
    };

    const recencyLabels = [
        { value: 4, key: 'rfm.recency.mostRecent' },
        { value: 3, key: 'rfm.recency.recent' },
        { value: 2, key: 'rfm.recency.lessRecent' },
        { value: 1, key: 'rfm.recency.leastRecent' }
    ];

    const frequencyLabels = [
        { value: 4, key: 'rfm.frequency.high' },
        { value: 3, key: 'rfm.frequency.mediumHigh' },
        { value: 2, key: 'rfm.frequency.mediumLow' },
        { value: 1, key: 'rfm.frequency.low' }
    ];

    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl">
                        {t('rfm.title')}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.metric')}:</span>
                        <ToggleGroup
                            type="single"
                            value={metricType}
                            onValueChange={(value) => value && setMetricType(value as MetricType)}
                        >
                            <ToggleGroupItem value="revenue" aria-label={t('common.revenue')}>
                                {t('common.revenue')}
                            </ToggleGroupItem>
                            <ToggleGroupItem value="aov" aria-label={t('rfm.metrics.aov')}>
                                {t('rfm.metrics.aov')}
                            </ToggleGroupItem>
                            <ToggleGroupItem value="customers" aria-label={t('common.customers')}>
                                {t('common.customers')}
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
                <CardDescription>
                    {getMetricDescription()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Color Legend */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('rfm.colorScale')}</span>
                            <div className="flex items-center gap-2 flex-1">
                                <div className="flex items-center gap-1">
                                    <div className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 bg-green-600 dark:bg-green-700"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('common.high')}</span>
                                </div>
                                <div className="flex-1 h-4 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600" style={{
                                    background: 'linear-gradient(to right, rgb(22, 163, 74), rgb(34, 197, 94), rgb(132, 204, 22), rgb(250, 204, 21), rgb(251, 191, 36), rgb(251, 146, 60), rgb(249, 115, 22), rgb(239, 68, 68), rgb(220, 38, 38))'
                                }}></div>
                                <div className="flex items-center gap-1">
                                    <div className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 bg-red-500 dark:bg-red-600"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('common.low')}</span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                {t(`rfm.colorScaleDescriptions.${metricType}`)}
                            </span>
                        </div>
                    </div>

                    {/* RFM Matrix */}
                    <div>
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full">
                                {/* Header row with F labels */}
                                <div className="flex mb-2">
                                    <div className="w-32 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        F →
                                    </div>
                                    {frequencyLabels.map((f) => {
                                        const range = frequencyRanges[f.value];
                                        return (
                                            <div key={f.value} className="flex-1 text-center px-1">
                                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    {t(f.key)}
                                                </div>
                                                {range && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {range.min === range.max
                                                            ? `${range.min} ${t('rfm.frequency.transaction')}`
                                                            : `${range.min}-${range.max} ${t('rfm.frequency.transactions')}`
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Matrix rows */}
                                {recencyLabels.map((r) => {
                                    const recencyRange = recencyRanges[r.value];
                                    return (
                                        <div key={r.value} className="flex mb-1">
                                            {/* R label */}
                                            <div className="w-32 flex flex-col items-center justify-center text-xs px-1">
                                                <div className="font-semibold text-gray-700 dark:text-gray-300">
                                                    {t(r.key)}
                                                </div>
                                                {recencyRange && (
                                                    <div className="text-gray-500 dark:text-gray-400 mt-0.5 text-center">
                                                        {recencyRange.min === recencyRange.max
                                                            ? `${recencyRange.min} ${t('rfm.recency.day')}`
                                                            : `${recencyRange.min}-${recencyRange.max} ${t('rfm.recency.days')}`
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                            {/* Cells */}
                                            {[4, 3, 2, 1].map((f) => {
                                                const key = `${r.value}-${f}`;
                                                const data = cellDataMap.get(key);

                                                return (
                                                    <TooltipProvider key={f} delayDuration={0}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className={`flex-1 h-20 border-2 rounded-md transition-all border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-help ${getColorIntensity(getMetricValue(data))}`}
                                                                >
                                                                    <div className="h-full flex flex-col items-center justify-center p-2 text-center">
                                                                        <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                                                            {getDisplayValue(data)}
                                                                        </div>
                                                                        {metricType !== 'customers' && data && data.count > 0 && (
                                                                            <div className="text-xs text-gray-700 dark:text-gray-200 mt-1">
                                                                                {formatNumber(data.count)} {t('rfm.metrics.customers')}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="max-w-xs">
                                                                <p className="text-sm">{getTooltipText(data)}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

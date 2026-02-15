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

    // Helper to get color intensity based on selected metric (theme palette: teal = high, destructive = low)
    const getColorIntensity = (value: number): string => {
        if (value === 0) return 'rfm-cell-0';

        const intensity = valueRange > 0
            ? (value - minValue) / valueRange
            : 0.5;

        if (intensity >= 0.9) return 'rfm-cell-9';
        if (intensity >= 0.8) return 'rfm-cell-8';
        if (intensity >= 0.7) return 'rfm-cell-7';
        if (intensity >= 0.6) return 'rfm-cell-6';
        if (intensity >= 0.5) return 'rfm-cell-5';
        if (intensity >= 0.4) return 'rfm-cell-4';
        if (intensity >= 0.3) return 'rfm-cell-3';
        if (intensity >= 0.2) return 'rfm-cell-2';
        if (intensity >= 0.1) return 'rfm-cell-1';
        return 'rfm-cell-1';
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
                        <span className="text-sm text-muted-foreground">{t('common.metric')}:</span>
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
                    {/* Color Legend – theme teal (high) to destructive (low) */}
                    <div className="p-3 rounded-lg border bg-muted/50 border-border">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-foreground">{t('rfm.colorScale')}</span>
                            <div className="flex items-center gap-2 flex-1">
                                <div className="flex items-center gap-1">
                                    <div className="w-6 h-6 rounded border border-border rfm-cell-9"></div>
                                    <span className="text-xs text-muted-foreground">{t('common.high')}</span>
                                </div>
                                <div className="flex-1 h-4 rounded-full overflow-hidden border border-border rfm-legend-bar"></div>
                                <div className="flex items-center gap-1">
                                    <div className="w-6 h-6 rounded border border-border rfm-cell-1"></div>
                                    <span className="text-xs text-muted-foreground">{t('common.low')}</span>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground italic">
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
                                    <div className="w-32 flex items-center justify-center text-sm font-semibold text-foreground">
                                        F →
                                    </div>
                                    {frequencyLabels.map((f) => {
                                        const range = frequencyRanges[f.value];
                                        return (
                                            <div key={f.value} className="flex-1 text-center px-1">
                                                <div className="text-xs font-semibold text-foreground">
                                                    {t(f.key)}
                                                </div>
                                                {range && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">
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
                                                <div className="font-semibold text-foreground">
                                                    {t(r.key)}
                                                </div>
                                                {recencyRange && (
                                                    <div className="text-muted-foreground mt-0.5 text-center text-xs">
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
                                                                    className={`flex-1 h-20 border-2 rounded-md transition-all border-border hover:border-muted-foreground/30 cursor-help ${getColorIntensity(getMetricValue(data))}`}
                                                                >
                                                                    <div className="h-full flex flex-col items-center justify-center p-2 text-center">
                                                                        <div className="text-xs font-semibold text-card-foreground">
                                                                            {getDisplayValue(data)}
                                                                        </div>
                                                                        {metricType !== 'customers' && data && data.count > 0 && (
                                                                            <div className="text-xs text-muted-foreground mt-1">
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

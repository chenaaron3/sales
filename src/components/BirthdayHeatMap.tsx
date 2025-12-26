import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

import { formatCurrency, formatNumber } from '../utils/i18n';
import type { BirthdaySalesData } from '../types';

type BirthdayType = 'customer' | 'importantPerson';

interface BirthdayHeatMapProps {
    data: BirthdaySalesData[];
    metric: 'salesCount' | 'revenue' | 'transactions';
    birthdayType: BirthdayType;
    onBirthdayTypeChange?: (type: BirthdayType) => void;
}

export function BirthdayHeatMap({
    data,
    metric,
    birthdayType,
    onBirthdayTypeChange
}: BirthdayHeatMapProps) {
    const { t } = useTranslation();

    if (data.length === 0) {
        return (
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <p className="text-gray-500 dark:text-gray-400">{t('temporal.birthday.noDataAvailable')}</p>
                </CardContent>
            </Card>
        );
    }

    const [hoveredBucket, setHoveredBucket] = useState<{
        dayText: string;
        birthdayTypeText: string;
        revenue: number;
        percentile: number;
    } | null>(null);

    // Group data into buckets for better visualization
    const bucketSize = 3;
    const buckets: { startDay: number; endDay: number; value: number; count: number }[] = [];
    for (let i = 0; i < data.length; i += bucketSize) {
        const chunk = data.slice(i, i + bucketSize);
        const startDay = chunk[0]?.daysFromBirthday ?? 0;
        const endDay = chunk[chunk.length - 1]?.daysFromBirthday ?? 0;
        const value = chunk.reduce((sum, d) => sum + d[metric], 0);
        buckets.push({ startDay, endDay, value, count: chunk.length });
    }

    // Calculate min/max for normalization
    const avgValues = buckets.map(b => b.value / b.count);
    const minValue = Math.min(...avgValues);
    const maxValue = Math.max(...avgValues);

    // Helper function to get color intensity (normalized)
    const getColorIntensity = (value: number) => {
        if (maxValue === 0 || maxValue === minValue) return 0;
        return (value - minValue) / (maxValue - minValue);
    };

    // Helper function to get color with high contrast
    const getColor = (intensity: number) => {
        if (intensity < 0.25) {
            const t = intensity / 0.25;
            const r = Math.floor(0);
            const g = Math.floor(100 + 155 * t);
            const b = Math.floor(255 - 55 * t);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (intensity < 0.5) {
            const t = (intensity - 0.25) / 0.25;
            const r = Math.floor(0 + 255 * t);
            const g = Math.floor(255);
            const b = Math.floor(200 - 200 * t);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (intensity < 0.75) {
            const t = (intensity - 0.5) / 0.25;
            const r = Math.floor(255);
            const g = Math.floor(255 - 100 * t);
            const b = Math.floor(0);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            const t = (intensity - 0.75) / 0.25;
            const r = Math.floor(255);
            const g = Math.floor(155 - 155 * t);
            const b = Math.floor(0);
            return `rgb(${r}, ${g}, ${b})`;
        }
    };


    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>
                    {t('temporal.birthday.title')}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('temporal.birthday.description')}
                </p>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('temporal.birthday.birthday')}:</span>
                        <ToggleGroup
                            type="single"
                            value={birthdayType}
                            onValueChange={(value) => value && onBirthdayTypeChange?.(value as BirthdayType)}
                        >
                            {(["customer", "importantPerson"] as BirthdayType[]).map((type) => (
                                <ToggleGroupItem
                                    key={type}
                                    value={type}
                                    aria-label={type === "customer" ? t('temporal.birthday.customerBirthday') : t('temporal.birthday.importantPerson')}
                                >
                                    {type === "customer"
                                        ? t('temporal.birthday.customerBirthday')
                                        : t('temporal.birthday.importantPerson')}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                </div>

                {/* Info Display */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[60px] flex items-center">
                    {hoveredBucket ? (
                        <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-semibold">{hoveredBucket.dayText}</span>{" "}
                            <span className="font-semibold">{hoveredBucket.birthdayTypeText}</span> {t('specialDays.hasRevenue')}{" "}
                            <span className="font-semibold">{formatCurrency(hoveredBucket.revenue)}</span>{" "}
                            <span className="text-gray-600 dark:text-gray-400">({t('charts.percentile', { value: hoveredBucket.percentile })})</span>
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            {t('temporal.birthday.hoverToSeeDetails')}
                        </p>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <div className="flex gap-1 mb-2" style={{ minWidth: "800px" }}>
                        {buckets.map((bucket, index) => {
                            const intensity = getColorIntensity(bucket.value / bucket.count);
                            const color = getColor(intensity);
                            const avgValue = bucket.value / bucket.count;

                            // Determine if it's before or after birthday
                            const isBefore = bucket.startDay < 0;
                            const isAfter = bucket.startDay > 0;
                            const isOnBirthday = bucket.startDay === 0;

                            // Get the day range text
                            let dayText = "";
                            if (bucket.startDay === bucket.endDay) {
                                const day = Math.abs(bucket.startDay);
                                if (isOnBirthday) {
                                    dayText = t('specialDays.onTheBirthday');
                                } else if (isBefore) {
                                    dayText = t('specialDays.daysBefore', { day });
                                } else {
                                    dayText = t('specialDays.daysAfter', { day });
                                }
                            } else {
                                const startDay = Math.abs(bucket.startDay);
                                const endDay = Math.abs(bucket.endDay);
                                if (isBefore) {
                                    dayText = t('specialDays.dayRangeBefore', { start: startDay, end: endDay });
                                } else if (isAfter) {
                                    dayText = t('specialDays.dayRangeAfter', { start: startDay, end: endDay });
                                } else {
                                    dayText = t('specialDays.dayRangeAround', { start: startDay, end: endDay });
                                }
                            }

                            const percentile = maxValue === minValue
                                ? 100
                                : Math.round(((avgValue - minValue) / (maxValue - minValue)) * 100);

                            const birthdayTypeText = birthdayType === "customer"
                                ? t('temporal.birthday.customerBirthday')
                                : t('temporal.birthday.importantPerson');

                            return (
                                <div
                                    key={index}
                                    className="flex-1 min-w-[20px] relative group cursor-pointer"
                                    style={{
                                        backgroundColor: color,
                                        height: "60px",
                                        border: "1px solid rgba(0,0,0,0.1)",
                                    }}
                                    onMouseEnter={() => setHoveredBucket({
                                        dayText,
                                        birthdayTypeText,
                                        revenue: Math.round(avgValue),
                                        percentile,
                                    })}
                                    onMouseLeave={() => setHoveredBucket(null)}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        {formatNumber(Math.round(avgValue))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* X-axis labels */}
                    <div className="flex gap-1 text-xs text-gray-600 dark:text-gray-400" style={{ minWidth: "800px" }}>
                        {buckets.map((bucket, index) => {
                            if (index % Math.ceil(buckets.length / 10) !== 0 && index !== buckets.length - 1) {
                                return <div key={index} className="flex-1 min-w-[20px]" />;
                            }
                            return (
                                <div key={index} className="flex-1 min-w-[20px] text-center">
                                    {bucket.startDay}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t('specialDays.coldLess')}</span>
                    <div className="flex-1 h-6 rounded" style={{
                        background: 'linear-gradient(to right, rgb(0, 100, 255), rgb(0, 255, 200), rgb(255, 255, 0), rgb(255, 155, 0), rgb(255, 0, 0))',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t('specialDays.hotMore')}</span>
                    <span className="ml-auto text-gray-500 dark:text-gray-400 text-xs">
                        {t('specialDays.max')}: {formatNumber(maxValue)} | {t('specialDays.min')}: {formatNumber(minValue)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

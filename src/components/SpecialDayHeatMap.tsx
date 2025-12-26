import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

import type { BirthdaySalesData } from "../types";

type SpecialDayType = 'customerBirthday' | 'importantPersonBirthday' | 'anniversary';

interface SpecialDayHeatMapProps {
    birthdayDataCustomer: BirthdaySalesData[];
    birthdayDataImportantPerson: BirthdaySalesData[];
    anniversaryData: BirthdaySalesData[];
    metric: "revenue";
}

export function SpecialDayHeatMap({
    birthdayDataCustomer,
    birthdayDataImportantPerson,
    anniversaryData,
    metric,
}: SpecialDayHeatMapProps) {
    const [selectedType, setSelectedType] = useState<SpecialDayType>('customerBirthday');
    const [hoveredBucket, setHoveredBucket] = useState<{
        dayText: string;
        type: string;
        revenue: number;
        percentile: number;
    } | null>(null);

    if (birthdayDataCustomer.length === 0 && birthdayDataImportantPerson.length === 0 && anniversaryData.length === 0) {
        return (
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <p className="text-gray-500 dark:text-gray-400">No special day data available</p>
                </CardContent>
            </Card>
        );
    }

    // Group data into buckets for better visualization
    const bucketSize = 3;
    const createBuckets = (data: BirthdaySalesData[], typeLabel: string) => {
        const buckets: { startDay: number; endDay: number; value: number; count: number; type: string }[] = [];
        for (let i = 0; i < data.length; i += bucketSize) {
            const chunk = data.slice(i, i + bucketSize);
            const startDay = chunk[0]?.daysFromBirthday ?? 0;
            const endDay = chunk[chunk.length - 1]?.daysFromBirthday ?? 0;
            const value = chunk.reduce((sum, d) => sum + d[metric], 0);
            buckets.push({ startDay, endDay, value, count: chunk.length, type: typeLabel });
        }
        return buckets;
    };

    const birthdayCustomerBuckets = createBuckets(birthdayDataCustomer, "Customer's Own Birthday");
    const birthdayImportantBuckets = createBuckets(birthdayDataImportantPerson, "Important Person's Birthday");
    const anniversaryBuckets = createBuckets(anniversaryData, "Anniversary");

    // Calculate min/max from bucket values (not raw data) since we're using bucket values for colors
    const getMinMaxFromBuckets = (buckets: { value: number; count: number }[]) => {
        if (buckets.length === 0) return { min: 0, max: 0 };
        // Use average values per bucket for normalization
        const avgValues = buckets.map(b => b.value / b.count);
        return {
            min: Math.min(...avgValues),
            max: Math.max(...avgValues),
        };
    };

    const birthdayCustomerMinMax = getMinMaxFromBuckets(birthdayCustomerBuckets);
    const birthdayImportantMinMax = getMinMaxFromBuckets(birthdayImportantBuckets);
    const anniversaryMinMax = getMinMaxFromBuckets(anniversaryBuckets);

    // Helper function to get color intensity (normalized to specific min/max)
    const getColorIntensity = (value: number, min: number, max: number) => {
        if (max === 0 || max === min) return 0;
        return (value - min) / (max - min);
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

    const getDayText = (bucket: { startDay: number; endDay: number }) => {
        const isBefore = bucket.startDay < 0;
        const isAfter = bucket.startDay > 0;
        const isOnDay = bucket.startDay === 0;

        if (bucket.startDay === bucket.endDay) {
            const day = Math.abs(bucket.startDay);
            if (isOnDay) {
                return "On the day";
            } else if (isBefore) {
                return `${day} day${day !== 1 ? 's' : ''} before`;
            } else {
                return `${day} day${day !== 1 ? 's' : ''} after`;
            }
        } else {
            const startDay = Math.abs(bucket.startDay);
            const endDay = Math.abs(bucket.endDay);
            if (isBefore) {
                return `${startDay}-${endDay} days before`;
            } else if (isAfter) {
                return `${startDay}-${endDay} days after`;
            } else {
                return `${startDay}-${endDay} days around`;
            }
        }
    };

    // Get the selected data and metadata
    const getSelectedData = () => {
        switch (selectedType) {
            case 'customerBirthday':
                return {
                    data: birthdayDataCustomer,
                    buckets: birthdayCustomerBuckets,
                    minMax: birthdayCustomerMinMax,
                    label: "Customer's Own Birthday",
                };
            case 'importantPersonBirthday':
                return {
                    data: birthdayDataImportantPerson,
                    buckets: birthdayImportantBuckets,
                    minMax: birthdayImportantMinMax,
                    label: "Important Person's Birthday",
                };
            case 'anniversary':
                return {
                    data: anniversaryData,
                    buckets: anniversaryBuckets,
                    minMax: anniversaryMinMax,
                    label: "Anniversary",
                };
        }
    };

    const selectedData = getSelectedData();

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Special Day Sales Correlation</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Revenue activity relative to special days (negative = before, positive = after)
                </p>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Event Type:</span>
                        <ToggleGroup
                            type="single"
                            value={selectedType}
                            onValueChange={(value) => value && setSelectedType(value as SpecialDayType)}
                        >
                            <ToggleGroupItem
                                value="customerBirthday"
                                aria-label="Customer's Own Birthday"
                            >
                                Customer's Own
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="importantPersonBirthday"
                                aria-label="Important Person's Birthday"
                            >
                                Important Person's
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="anniversary"
                                aria-label="Anniversary"
                            >
                                Anniversary
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>

                {/* Info Display */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[60px] flex items-center">
                    {hoveredBucket ? (
                        <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-semibold">{hoveredBucket.dayText}</span>{" "}
                            <span className="font-semibold">{hoveredBucket.type}</span> has{" "}
                            <span className="font-semibold">¥{hoveredBucket.revenue.toLocaleString('ja-JP')}</span> revenue{" "}
                            <span className="text-gray-600 dark:text-gray-400">({hoveredBucket.percentile}th percentile)</span>
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Hover over a bucket to see details
                        </p>
                    )}
                </div>

                {/* Selected Heatmap */}
                <div className="mb-4">
                    <div className="overflow-x-auto">
                        <div className="flex gap-1 mb-2" style={{ minWidth: "800px" }}>
                            {selectedData.buckets.map((bucket, index) => {
                                const avgValue = bucket.value / bucket.count;
                                const intensity = getColorIntensity(avgValue, selectedData.minMax.min, selectedData.minMax.max);
                                const color = getColor(intensity);
                                const dayText = getDayText(bucket);
                                const percentile = selectedData.minMax.max === selectedData.minMax.min
                                    ? 100
                                    : Math.round(((avgValue - selectedData.minMax.min) / (selectedData.minMax.max - selectedData.minMax.min)) * 100);

                                return (
                                    <div
                                        key={`${selectedType}-${index}`}
                                        className="flex-1 min-w-[20px] relative group cursor-pointer"
                                        style={{
                                            backgroundColor: color,
                                            height: "60px",
                                            border: "1px solid rgba(0,0,0,0.1)",
                                        }}
                                        onMouseEnter={() => setHoveredBucket({
                                            dayText,
                                            type: selectedData.label,
                                            revenue: Math.round(avgValue),
                                            percentile,
                                        })}
                                        onMouseLeave={() => setHoveredBucket(null)}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            {Math.round(avgValue).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-1 text-xs text-gray-600 dark:text-gray-400" style={{ minWidth: "800px" }}>
                            {selectedData.buckets.map((bucket, index) => {
                                if (index % Math.ceil(selectedData.buckets.length / 10) !== 0 && index !== selectedData.buckets.length - 1) {
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
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Cold (Less)</span>
                    <div className="flex-1 h-6 rounded" style={{
                        background: 'linear-gradient(to right, rgb(0, 100, 255), rgb(0, 255, 200), rgb(255, 255, 0), rgb(255, 155, 0), rgb(255, 0, 0))',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Hot (More)</span>
                    <span className="ml-auto text-gray-500 dark:text-gray-400 text-xs">
                        Each heatmap normalized independently
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}


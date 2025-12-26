import { useState } from 'react';

import type { BirthdaySalesData } from "../types";
import type { BirthdayType } from "../utils/dataAnalysis";

interface BirthdayHeatMapProps {
    data: BirthdaySalesData[];
    metric: "revenue";
    birthdayType: BirthdayType;
    onBirthdayTypeChange?: (type: BirthdayType) => void;
}

export function BirthdayHeatMap({
    data,
    metric,
    birthdayType,
    onBirthdayTypeChange
}: BirthdayHeatMapProps) {
    const [hoveredBucket, setHoveredBucket] = useState<{
        dayText: string;
        birthdayTypeText: string;
        revenue: number;
        percentile: number;
    } | null>(null);

    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
                <p className="text-gray-500 dark:text-gray-400">No birthday data available</p>
            </div>
        );
    }

    // Find max value for normalization
    const maxValue = Math.max(...data.map((d) => d[metric]));
    const minValue = Math.min(...data.map((d) => d[metric]));

    // Helper function to get color intensity
    const getColorIntensity = (value: number) => {
        if (maxValue === 0) return 0;
        return (value - minValue) / (maxValue - minValue || 1);
    };

    // Helper function to get color with high contrast
    // Blue (cold/low sales) -> Cyan -> Yellow -> Orange -> Red (hot/high sales)
    const getColor = (intensity: number) => {
        if (intensity < 0.25) {
            // Blue to cyan (cold)
            const t = intensity / 0.25;
            const r = Math.floor(0);
            const g = Math.floor(100 + 155 * t);
            const b = Math.floor(255 - 55 * t);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (intensity < 0.5) {
            // Cyan to yellow
            const t = (intensity - 0.25) / 0.25;
            const r = Math.floor(0 + 255 * t);
            const g = Math.floor(255);
            const b = Math.floor(200 - 200 * t);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (intensity < 0.75) {
            // Yellow to orange
            const t = (intensity - 0.5) / 0.25;
            const r = Math.floor(255);
            const g = Math.floor(255 - 100 * t);
            const b = Math.floor(0);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // Orange to red (hot)
            const t = (intensity - 0.75) / 0.25;
            const r = Math.floor(255);
            const g = Math.floor(155 - 155 * t);
            const b = Math.floor(0);
            return `rgb(${r}, ${g}, ${b})`;
        }
    };

    // Group data into buckets for better visualization (e.g., 5-day buckets)
    const bucketSize = 3; // 3-day buckets
    const buckets: { startDay: number; endDay: number; value: number; count: number }[] = [];

    for (let i = 0; i < data.length; i += bucketSize) {
        const chunk = data.slice(i, i + bucketSize);
        const startDay = chunk[0]?.daysFromBirthday ?? 0;
        const endDay = chunk[chunk.length - 1]?.daysFromBirthday ?? 0;
        const value = chunk.reduce((sum, d) => sum + d[metric], 0);
        buckets.push({ startDay, endDay, value, count: chunk.length });
    }


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Birthday Sales Correlation
                    </h2>
                    <div className="group relative">
                        <svg
                            className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                            <p className="mb-2">
                                <strong>How to read this heatmap:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li><strong>Negative days</strong> = Days before the birthday</li>
                                <li><strong>Positive days</strong> = Days after the birthday</li>
                                <li><strong>Blue colors</strong> = Lower revenue (cold periods)</li>
                                <li><strong>Red colors</strong> = Higher revenue (hot periods)</li>
                                <li>Hover over bars to see exact revenue values</li>
                            </ul>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Revenue activity relative to birthdays (negative = before birthday, positive = after)
                </p>
            </div>

            <div className="mb-4 space-y-3">
                {/* Birthday Type Toggle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Birthday Type
                    </label>
                    <div className="flex gap-2">
                        {(["customer", "importantPerson"] as BirthdayType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => onBirthdayTypeChange?.(type)}
                                className={`px-4 py-2 rounded-md text-sm ${birthdayType === type
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    }`}
                            >
                                {type === "customer"
                                    ? "Customer's Own Birthday"
                                    : "Important Person's Birthday"}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Info Display */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[60px] flex items-center">
                {hoveredBucket ? (
                    <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">{hoveredBucket.dayText}</span>{" "}
                        <span className="font-semibold">{hoveredBucket.birthdayTypeText}</span> has{" "}
                        <span className="font-semibold">¥{hoveredBucket.revenue.toLocaleString('ja-JP')}</span> revenue{" "}
                        <span className="text-gray-600 dark:text-gray-400">({hoveredBucket.percentile}th percentile)</span>
                    </p>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Hover over a bucket to see details
                    </p>
                )}
            </div>

            <div className="overflow-x-auto">
                <div className="flex gap-1 mb-2" style={{ minWidth: "800px" }}>
                    {buckets.map((bucket, index) => {
                        const intensity = getColorIntensity(bucket.value);
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
                                dayText = "On the birthday";
                            } else if (isBefore) {
                                dayText = `${day} day${day !== 1 ? 's' : ''} before`;
                            } else {
                                dayText = `${day} day${day !== 1 ? 's' : ''} after`;
                            }
                        } else {
                            const startDay = Math.abs(bucket.startDay);
                            const endDay = Math.abs(bucket.endDay);
                            if (isBefore) {
                                dayText = `${startDay}-${endDay} days before`;
                            } else if (isAfter) {
                                dayText = `${startDay}-${endDay} days after`;
                            } else {
                                dayText = `${startDay}-${endDay} days around`;
                            }
                        }

                        const birthdayTypeText = birthdayType === "customer"
                            ? "Customer's Own Birthday"
                            : "Important Person's Birthday";

                        // Calculate percentile
                        const percentile = maxValue === minValue
                            ? 100
                            : Math.round(((avgValue - minValue) / (maxValue - minValue)) * 100);

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
                                    {Math.round(avgValue).toLocaleString()}
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
                <span className="text-gray-600 dark:text-gray-400 font-medium">Cold (Less)</span>
                <div className="flex-1 h-6 rounded" style={{
                    background: 'linear-gradient(to right, rgb(0, 100, 255), rgb(0, 255, 200), rgb(255, 255, 0), rgb(255, 155, 0), rgb(255, 0, 0))',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
                <span className="text-gray-600 dark:text-gray-400 font-medium">Hot (More)</span>
                <span className="ml-auto text-gray-500 dark:text-gray-400 text-xs">
                    Max: {maxValue.toLocaleString()} | Min: {minValue.toLocaleString()}
                </span>
            </div>
        </div>
    );
}

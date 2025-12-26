import type { BirthdaySalesData } from "../types";

import type { BirthdayType } from "../utils/dataAnalysis";

interface BirthdayHeatMapProps {
    data: BirthdaySalesData[];
    metric: "salesCount" | "revenue" | "transactions";
    birthdayType: BirthdayType;
    onMetricChange?: (metric: "salesCount" | "revenue" | "transactions") => void;
    onBirthdayTypeChange?: (type: BirthdayType) => void;
}

export function BirthdayHeatMap({
    data,
    metric,
    birthdayType,
    onMetricChange,
    onBirthdayTypeChange
}: BirthdayHeatMapProps) {
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

    const metricLabels = {
        salesCount: "Sales Count",
        revenue: "Revenue",
        transactions: "Transactions",
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Birthday Sales Correlation
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sales activity relative to birthdays (negative = before birthday, positive = after)
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

                {/* Metric Toggle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Metric
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {(["salesCount", "revenue", "transactions"] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => onMetricChange?.(m)}
                                className={`px-3 py-1 rounded text-sm ${metric === m
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    }`}
                            >
                                {metricLabels[m]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="flex gap-1 mb-2" style={{ minWidth: "800px" }}>
                    {buckets.map((bucket, index) => {
                        const intensity = getColorIntensity(bucket.value);
                        const color = getColor(intensity);
                        const avgValue = bucket.value / bucket.count;

                        return (
                            <div
                                key={index}
                                className="flex-1 min-w-[20px] relative group"
                                style={{
                                    backgroundColor: color,
                                    height: "60px",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                }}
                                title={`Days ${bucket.startDay} to ${bucket.endDay}: ${metricLabels[metric]} = ${Math.round(avgValue).toLocaleString()}`}
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

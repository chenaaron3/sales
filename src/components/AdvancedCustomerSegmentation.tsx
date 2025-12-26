import { useState } from 'react';
import {
    Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, PolarAngleAxis, PolarGrid,
    PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import type { CustomerSegment, RFMSegment } from '../types';

interface AdvancedCustomerSegmentationProps {
    rfmSegments: RFMSegment[];
    frequencySegments: CustomerSegment[];
    recencySegments: CustomerSegment[];
    channelSegments: CustomerSegment[];
    aovSegments: CustomerSegment[];
    lifetimeValueSegments: CustomerSegment[];
}

type SegmentationType = 'rfm' | 'frequency' | 'recency' | 'channel' | 'aov' | 'lifetimeValue';

export function AdvancedCustomerSegmentation({
    rfmSegments,
    frequencySegments,
    recencySegments,
    channelSegments,
    aovSegments,
    lifetimeValueSegments,
}: AdvancedCustomerSegmentationProps) {
    const [activeSegment, setActiveSegment] = useState<SegmentationType>('rfm');

    const segmentData = {
        rfm: rfmSegments,
        frequency: frequencySegments,
        recency: recencySegments,
        channel: channelSegments,
        aov: aovSegments,
        lifetimeValue: lifetimeValueSegments,
    };

    const segmentLabels: Record<SegmentationType, string> = {
        rfm: 'RFM Analysis',
        frequency: 'Purchase Frequency',
        recency: 'Recency',
        channel: 'Channel Preference',
        aov: 'Average Order Value',
        lifetimeValue: 'Lifetime Value',
    };

    const currentData = segmentData[activeSegment];
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8'];

    const chartData = currentData.map((segment, index) => ({
        ...segment,
        fill: COLORS[index % COLORS.length],
    }));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Advanced Customer Segmentation
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Explore different ways to segment your customer base for targeted marketing and insights
            </p>

            {/* Segmentation Type Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Segmentation Dimension
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(['rfm', 'frequency', 'recency', 'channel', 'aov', 'lifetimeValue'] as SegmentationType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveSegment(type)}
                            className={`px-4 py-2 rounded-md text-sm ${activeSegment === type
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                        >
                            {segmentLabels[type]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {segmentLabels[activeSegment]} Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart margin={{ top: 20, right: 150, bottom: 20, left: 150 }}>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={(entry: any) => `${entry.segment}: ${entry.percentage.toFixed(1)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="segment"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => value?.toLocaleString('ja-JP') || ''}
                                content={(props: any) => {
                                    if (!props.active || !props.payload?.[0]) return null;
                                    const data = props.payload[0].payload;
                                    return (
                                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
                                            <p className="font-semibold text-gray-900 dark:text-white">{data.segment}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Count: {data.count.toLocaleString('ja-JP')}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Percentage: {data.percentage.toFixed(1)}%
                                            </p>
                                        </div>
                                    );
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart - Revenue by Segment */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Revenue by Segment
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => `¥${(value / 1000000).toFixed(1)}M`} />
                            <YAxis dataKey="segment" type="category" width={140} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(value: number | undefined) => value ? `¥${value.toLocaleString('ja-JP')}` : ''} />
                            <Legend />
                            <Bar dataKey="totalRevenue" fill="#8884d8" name="Total Revenue">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Segment Information */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Segment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chartData.map((segment, index) => {
                        // Only show RFM radar chart for RFM segments
                        const isRFM = activeSegment === 'rfm' && 'rScore' in segment;
                        const rfmData = isRFM ? [
                            { axis: 'Recency', value: segment.rScore, fullMark: 4 },
                            { axis: 'Frequency', value: segment.fScore, fullMark: 4 },
                            { axis: 'Monetary', value: segment.mScore, fullMark: 4 },
                        ] : null;

                        return (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-2 mb-3">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: segment.fill }}
                                    />
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {segment.segment}
                                    </h4>
                                </div>
                                {'description' in segment && segment.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 italic">
                                        {segment.description}
                                    </p>
                                )}
                                {isRFM && rfmData && (
                                    <div className="mb-3">
                                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">RFM Scores</div>
                                        <ResponsiveContainer width="100%" height={150}>
                                            <RadarChart data={rfmData}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis
                                                    dataKey="axis"
                                                    tick={{ fontSize: 10, fill: '#6b7280' }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={90}
                                                    domain={[0, 4]}
                                                    tick={false}
                                                    axisLine={false}
                                                />
                                                <Radar
                                                    name="RFM"
                                                    dataKey="value"
                                                    stroke={segment.fill}
                                                    fill={segment.fill}
                                                    fillOpacity={0.6}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                        <div className="flex justify-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                            <span>R: {segment.rScore.toFixed(1)}</span>
                                            <span>F: {segment.fScore.toFixed(1)}</span>
                                            <span>M: {segment.mScore.toFixed(1)}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Count:</span>
                                        <span className="font-medium">{segment.count.toLocaleString('ja-JP')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Percentage:</span>
                                        <span className="font-medium">{segment.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Revenue:</span>
                                        <span className="font-medium">¥{segment.totalRevenue.toLocaleString('ja-JP')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Avg per Customer:</span>
                                        <span className="font-medium">¥{Math.round(segment.averageRevenue).toLocaleString('ja-JP')}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


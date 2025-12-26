import { useState } from 'react';
import {
    Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

import type { CustomerSegment } from '../types';
interface AdvancedCustomerSegmentationProps {
    frequencySegments: CustomerSegment[];
    ageSegments: CustomerSegment[];
    genderSegments: CustomerSegment[];
    channelSegments: CustomerSegment[];
    aovSegments: CustomerSegment[];
    lifetimeValueSegments: CustomerSegment[];
}

type SegmentationType = 'frequency' | 'age' | 'gender' | 'channel' | 'aov' | 'lifetimeValue';

export function AdvancedCustomerSegmentation({
    frequencySegments,
    ageSegments,
    genderSegments,
    channelSegments,
    aovSegments,
    lifetimeValueSegments,
}: AdvancedCustomerSegmentationProps) {
    const [activeSegment, setActiveSegment] = useState<SegmentationType>('frequency');

    const segmentData = {
        frequency: frequencySegments,
        age: ageSegments,
        gender: genderSegments,
        channel: channelSegments,
        aov: aovSegments,
        lifetimeValue: lifetimeValueSegments,
    };

    const segmentLabels: Record<SegmentationType, string> = {
        frequency: 'Purchase Frequency',
        age: 'Age',
        gender: 'Gender',
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
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-2xl">
                    Advanced Customer Segmentation
                </CardTitle>
                <CardDescription>
                    Explore different ways to segment your customer base for targeted marketing and insights
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Segmentation Type Selector */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Segmentation Dimension
                        </label>
                        <ToggleGroup
                            type="single"
                            value={activeSegment}
                            onValueChange={(value) => value && setActiveSegment(value as SegmentationType)}
                        >
                            {(['frequency', 'age', 'gender', 'channel', 'aov', 'lifetimeValue'] as SegmentationType[]).map((type) => (
                                <ToggleGroupItem
                                    key={type}
                                    value={type}
                                    aria-label={segmentLabels[type]}
                                >
                                    {segmentLabels[type]}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
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
                                            <div className="bg-card p-3 border border-border rounded shadow-lg">
                                                <p className="font-semibold text-card-foreground">{data.segment}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Count: {data.count.toLocaleString('ja-JP')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
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
                                <Tooltip
                                    content={(props: any) => {
                                        if (!props.active || !props.payload?.[0]) return null;
                                        const data = props.payload[0].payload;
                                        // Calculate LTV: average lifetime value per customer = totalRevenue / customerCount
                                        const ltv = data.count > 0 ? data.totalRevenue / data.count : 0;
                                        return (
                                            <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                                                <p className="text-sm font-semibold text-card-foreground mb-2">{data.segment}</p>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-sm"
                                                            style={{ backgroundColor: data.fill }}
                                                        />
                                                        <span className="text-sm text-muted-foreground flex-1">
                                                            Total Revenue:
                                                        </span>
                                                        <span className="text-sm font-semibold text-card-foreground">
                                                            ¥{data.totalRevenue.toLocaleString('ja-JP')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'transparent' }} />
                                                        <span className="text-sm text-muted-foreground flex-1">
                                                            AOV:
                                                        </span>
                                                        <span className="text-sm font-semibold text-card-foreground">
                                                            ¥{Math.round(data.averageRevenue).toLocaleString('ja-JP')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'transparent' }} />
                                                        <span className="text-sm text-muted-foreground flex-1">
                                                            LTV:
                                                        </span>
                                                        <span className="text-sm font-semibold text-card-foreground">
                                                            ¥{Math.round(ltv).toLocaleString('ja-JP')}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground pt-1">
                                                        {data.count.toLocaleString('ja-JP')} customers ({data.percentage.toFixed(1)}%)
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar dataKey="totalRevenue" fill="#8884d8" name="Total Revenue">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


import {
    CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import { formatCurrency } from '../utils/i18n';
import { SEGMENT_COLORS } from '../utils/chartColors';
import type { AttributeTrend } from '../types';

interface AttributeTrendsProps {
    data: AttributeTrend[];
    attribute: 'color' | 'material';
}

export function AttributeTrendsChart({ data }: AttributeTrendsProps) {
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
                <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                    <p className="text-sm font-semibold text-card-foreground mb-2">{label}</p>
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

    // Get all unique attributes
    const allAttributes = new Set<string>();
    data.forEach((entry) => {
        Object.keys(entry).forEach((key) => {
            if (key !== 'date') {
                allAttributes.add(key);
            }
        });
    });

    const topAttributes = Array.from(allAttributes)
        .map(attr => {
            const total = data.reduce((sum, entry) => sum + (entry[attr] as number || 0), 0);
            return { attr, total };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 8)
        .map(item => item.attr);

    const colors = SEGMENT_COLORS;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                {topAttributes.map((attr, index) => (
                    <Line
                        key={attr}
                        type="monotone"
                        dataKey={attr}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}

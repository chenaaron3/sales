import {
    CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import type { AttributeTrend } from '../types';

interface AttributeTrendsProps {
    data: AttributeTrend[];
    attribute: 'color' | 'material';
}

export function AttributeTrendsChart({ data, attribute }: AttributeTrendsProps) {
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

    const colors = [
        '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
        '#d084d0', '#ffb347', '#87ceeb'
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {attribute === 'color' ? 'Color' : 'Material'} Trends Over Time (Top 8)
            </h2>
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
                    <Tooltip />
                    <Legend />
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
        </div>
    );
}


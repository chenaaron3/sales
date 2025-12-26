import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { DayOfWeekData } from '../types';

interface DayOfWeekAnalysisProps {
    data: DayOfWeekData[];
    metric: 'revenue';
}

export function DayOfWeekAnalysisChart({ data, metric }: DayOfWeekAnalysisProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Sales by Day of Week
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                        formatter={(value: number | undefined) => value !== undefined ? `¥${value.toLocaleString('ja-JP')}` : ''}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            color: '#000000',
                        }}
                    />
                    <Bar dataKey={metric} fill="#8884d8" name="Revenue" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}


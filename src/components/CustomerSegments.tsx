import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { CustomerSegment } from '../types';

interface CustomerSegmentsProps {
    data: CustomerSegment[];
}

export function CustomerSegmentsChart({ data }: CustomerSegmentsProps) {
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

    const chartData = data.map((segment, index) => ({
        ...segment,
        fill: COLORS[index % COLORS.length],
    }));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Customer Segmentation by Lifetime Value
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => `${entry.segment}: ${entry.percentage.toFixed(1)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                    {chartData.map((segment, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: segment.fill }}
                                />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {segment.segment}
                                </h3>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <div>Count: {segment.count.toLocaleString('ja-JP')}</div>
                                <div>Total Revenue: ¥{segment.totalRevenue.toLocaleString('ja-JP')}</div>
                                <div>Avg per Customer: ¥{Math.round(segment.averageRevenue).toLocaleString('ja-JP')}</div>
                                <div>Percentage: {segment.percentage.toFixed(1)}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


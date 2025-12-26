import {
    Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis,
    YAxis
} from 'recharts';

import type { Granularity } from '../utils/dataAnalysis';
import type { TimeSeriesData } from '../types';

interface TrendChartProps {
    data: TimeSeriesData[];
    granularity: Granularity;
}

const granularityLabels: Record<Granularity, string> = {
    daily: 'Daily',
    '3day': '3-Day',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
};

export function TrendChart({ data, granularity }: TrendChartProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {granularityLabels[granularity]} Sales Trends
            </h2>
            <div className="space-y-8">
                {/* Revenue Chart */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Revenue</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip formatter={(value: number | undefined) => value ? `¥${value.toLocaleString('ja-JP')}` : ''} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Transactions and Customers Combined */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Transactions & Customers</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="transactions" fill="#82ca9d" name="Transactions" />
                            <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#ffc658" strokeWidth={2} name="Customers" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

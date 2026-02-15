import {
    CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import { SEGMENT_COLORS } from '../utils/chartColors';
import type { CategorySales } from '../types';

interface CategorySalesChartProps {
    data: CategorySales[];
    selectedCategories?: string[];
}

export function CategorySalesChart({ data, selectedCategories }: CategorySalesChartProps) {
    // Get all categories from data
    const allCategories = new Set<string>();
    data.forEach(entry => {
        Object.keys(entry).forEach(key => {
            if (key !== 'date') {
                allCategories.add(key);
            }
        });
    });

    const categoriesToShow = selectedCategories && selectedCategories.length > 0
        ? selectedCategories.filter(cat => allCategories.has(cat))
        : Array.from(allCategories).slice(0, 10); // Limit to 10 for readability

    // Data is already aggregated by the selected granularity, so use it directly
    const chartData = data;

    const colors = SEGMENT_COLORS;

    return (
        <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-8">
            <h2 className="text-xl font-bold text-card-foreground mb-4">
                Sales Volume by Category Over Time
            </h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    {categoriesToShow.map((category, index) => (
                        <Line
                            key={category}
                            type="monotone"
                            dataKey={category}
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

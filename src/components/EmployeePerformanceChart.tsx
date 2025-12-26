import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import type { EmployeePerformance } from '../types';

interface EmployeePerformanceChartProps {
    data: EmployeePerformance[];
}

const PRODUCT_COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
    '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b',
    '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e', '#e17055'
];

export function EmployeePerformanceChart({ data }: EmployeePerformanceChartProps) {
    const [hoveredItem, setHoveredItem] = useState<EmployeePerformance | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No data available</p>
            </div>
        );
    }

    // Process each employee: get top 10 products, group rest as "Others"
    const processedData = data
        .filter((item) => item && item.staffName && item.products && Array.isArray(item.products))
        .map((item) => {
            // Sort products by revenue and get top 10
            const sortedProducts = [...item.products]
                .filter((p) => p && p.productName && p.revenue)
                .sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

            const top10Products = sortedProducts.slice(0, 10);
            const remainingProducts = sortedProducts.slice(10);

            // Calculate "Others" revenue
            const othersRevenue = remainingProducts.reduce((sum, p) => sum + (p.revenue || 0), 0);

            // Create processed products list with "Others" if needed
            const processedProducts = [...top10Products];
            if (othersRevenue > 0) {
                processedProducts.push({
                    productName: 'Others',
                    revenue: othersRevenue,
                });
            }

            return {
                ...item,
                processedProducts,
            };
        });

    // Get all unique products across all employees (including "Others")
    const allProducts = new Set<string>();
    processedData.forEach((item) => {
        if (item.processedProducts && Array.isArray(item.processedProducts)) {
            item.processedProducts.forEach((product) => {
                if (product && product.productName) {
                    allProducts.add(product.productName);
                }
            });
        }
    });
    const productList = Array.from(allProducts);

    // Prepare chart data with product breakdown
    const chartData = processedData.map((item) => {
        const entry: any = {
            name: item.staffName.length > 30 ? item.staffName.substring(0, 30) + '...' : item.staffName,
            fullName: item.staffName,
            totalRevenue: item.totalRevenue || 0,
            originalItem: {
                ...item,
                products: item.processedProducts,
            },
        };

        // Add product revenues
        productList.forEach((productName) => {
            const productData = item.processedProducts.find((p) => p && p.productName === productName);
            entry[productName] = productData ? (productData.revenue || 0) : 0;
        });

        return entry;
    });

    const handleCellMouseEnter = (entry: any) => {
        if (entry && entry.originalItem) {
            setHoveredItem(entry.originalItem);
        }
    };

    return (
        <div className="flex gap-6 -mx-6">
            <div className="flex-1 overflow-visible">
                <ResponsiveContainer width="100%" height={800}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: -170, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={180}
                            tick={(props: any) => {
                                const { x, y, payload } = props;
                                return (
                                    <g transform={`translate(${x},${y})`}>
                                        <text
                                            x={20}
                                            y={0}
                                            dy={3}
                                            textAnchor="start"
                                            fill="#000000"
                                            className="dark:fill-white"
                                            fontSize={14}
                                            fontWeight="bold"
                                        >
                                            {payload.value}
                                        </text>
                                    </g>
                                );
                            }}
                            angle={0}
                            axisLine={false}
                            tickLine={false}
                        />
                        {productList.map((productName, productIndex) => (
                            <Bar
                                key={productName}
                                dataKey={productName}
                                stackId="products"
                                fill={PRODUCT_COLORS[productIndex % PRODUCT_COLORS.length]}
                                onMouseEnter={handleCellMouseEnter}
                            >
                                {chartData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={PRODUCT_COLORS[productIndex % PRODUCT_COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="w-80 flex-shrink-0">
                <div className="sticky top-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm min-h-[200px]">
                    {hoveredItem ? (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                {hoveredItem.staffName}
                            </h3>
                            <div className="space-y-2">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Total Revenue:</span>{' '}
                                    <span className="text-gray-900 dark:text-white font-semibold">
                                        ¥{hoveredItem.totalRevenue.toLocaleString('ja-JP')}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Products:
                                    </p>
                                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                                        {[...hoveredItem.products]
                                            .sort((a, b) => b.revenue - a.revenue)
                                            .map((product, index) => (
                                                <div
                                                    key={product.productName}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <div
                                                        className="w-3 h-3 rounded-sm flex-shrink-0"
                                                        style={{
                                                            backgroundColor:
                                                                PRODUCT_COLORS[index % PRODUCT_COLORS.length],
                                                        }}
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-300 flex-1 truncate">
                                                        {product.productName}
                                                    </span>
                                                    <span className="text-gray-900 dark:text-white font-semibold flex-shrink-0">
                                                        ¥{product.revenue.toLocaleString('ja-JP')}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                Hover over a bar to see product breakdown
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


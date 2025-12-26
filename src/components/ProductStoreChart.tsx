import { useState } from 'react';
import {
    Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import type { ProductStorePerformance } from '../types';

interface ProductStoreChartProps {
    data: ProductStorePerformance[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8'];

export function ProductStoreChart({ data }: ProductStoreChartProps) {
    const [viewMode, setViewMode] = useState<'byProduct' | 'byStore'>('byProduct');
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [selectedStore, setSelectedStore] = useState<string | null>(null);

    // Get unique products and stores
    const uniqueProducts = Array.from(new Set(data.map(d => d.productName))).slice(0, 20);
    const uniqueStores = Array.from(new Set(data.map(d => d.storeName))).slice(0, 20);

    // Filter data based on view mode
    let chartData: any[] = [];
    let title = '';

    if (viewMode === 'byProduct' && selectedProduct) {
        chartData = data
            .filter(d => d.productName === selectedProduct)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10)
            .map(d => ({
                name: d.storeName.length > 20 ? d.storeName.substring(0, 20) + '...' : d.storeName,
                fullName: d.storeName,
                revenue: d.revenue,
                quantity: d.quantity,
                transactions: d.transactions,
            }));
        title = `Store Performance for: ${selectedProduct.length > 40 ? selectedProduct.substring(0, 40) + '...' : selectedProduct}`;
    } else if (viewMode === 'byStore' && selectedStore) {
        chartData = data
            .filter(d => d.storeName === selectedStore)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10)
            .map(d => ({
                name: d.productName.length > 30 ? d.productName.substring(0, 30) + '...' : d.productName,
                fullName: d.productName,
                revenue: d.revenue,
                quantity: d.quantity,
                transactions: d.transactions,
            }));
        title = `Product Performance at: ${selectedStore}`;
    }

    if (chartData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Product by Store Performance
                </h2>
                <div className="mb-4">
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setViewMode('byProduct')}
                            className={`px-4 py-2 rounded-md text-sm ${viewMode === 'byProduct'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            By Product
                        </button>
                        <button
                            onClick={() => setViewMode('byStore')}
                            className={`px-4 py-2 rounded-md text-sm ${viewMode === 'byStore'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            By Store
                        </button>
                    </div>
                    {viewMode === 'byProduct' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Product
                            </label>
                            <select
                                value={selectedProduct || ''}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">-- Select a product --</option>
                                {uniqueProducts.map(product => (
                                    <option key={product} value={product}>
                                        {product.length > 60 ? product.substring(0, 60) + '...' : product}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Store
                            </label>
                            <select
                                value={selectedStore || ''}
                                onChange={(e) => setSelectedStore(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">-- Select a store --</option>
                                {uniqueStores.map(store => (
                                    <option key={store} value={store}>{store}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <p className="text-gray-500 dark:text-gray-400">Please select a {viewMode === 'byProduct' ? 'product' : 'store'} to view performance</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {title}
            </h2>
            <div className="mb-4">
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => {
                            setViewMode('byProduct');
                            setSelectedProduct(null);
                            setSelectedStore(null);
                        }}
                        className={`px-4 py-2 rounded-md text-sm ${viewMode === 'byProduct'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                            }`}
                    >
                        By Product
                    </button>
                    <button
                        onClick={() => {
                            setViewMode('byStore');
                            setSelectedProduct(null);
                            setSelectedStore(null);
                        }}
                        className={`px-4 py-2 rounded-md text-sm ${viewMode === 'byStore'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                            }`}
                    >
                        By Store
                    </button>
                </div>
                {viewMode === 'byProduct' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Product
                        </label>
                        <select
                            value={selectedProduct || ''}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">-- Select a product --</option>
                            {uniqueProducts.map(product => (
                                <option key={product} value={product}>
                                    {product.length > 60 ? product.substring(0, 60) + '...' : product}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Store
                        </label>
                        <select
                            value={selectedStore || ''}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">-- Select a store --</option>
                            {uniqueStores.map(store => (
                                <option key={store} value={store}>{store}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: viewMode === 'byProduct' ? 120 : 200, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" width={viewMode === 'byProduct' ? 110 : 180} tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number | undefined) => value !== undefined ? `¥${value.toLocaleString('ja-JP')}` : ''}
                        labelFormatter={(label) => {
                            const item = chartData.find(d => d.name === label);
                            return item?.fullName || label;
                        }}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue">
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}


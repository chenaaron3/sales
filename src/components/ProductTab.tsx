import { useState } from 'react';

import { AttributeTrendsChart } from './AttributeTrends';
import { ProductPerformanceChart } from './ProductPerformance';
import { ProductTrendsChart } from './ProductTrendsChart';

import type { AttributeTrend, PerformanceWithStoreBreakdown, ProductTrend, CollectionTrend } from '../types';
interface ProductTabProps {
    productTrends: ProductTrend[];
    collectionTrends: CollectionTrend[];
    productPerformanceWithStores: PerformanceWithStoreBreakdown[];
    collectionPerformanceWithStores: PerformanceWithStoreBreakdown[];
    colorTrends: AttributeTrend[];
    materialTrends: AttributeTrend[];
}

export function ProductTab({
    productTrends,
    collectionTrends,
    productPerformanceWithStores,
    collectionPerformanceWithStores,
    colorTrends,
    materialTrends,
}: ProductTabProps) {
    const [productViewType, setProductViewType] = useState<'product' | 'collection'>('product');
    const [attributeType, setAttributeType] = useState<'color' | 'material'>('color');

    return (
        <div className="space-y-8">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    View By
                </label>
                <div className="flex gap-2 mb-4">
                    {(['product', 'collection'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setProductViewType(type)}
                            className={`px-4 py-2 rounded-md text-sm ${productViewType === type
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <ProductPerformanceChart
                data={productViewType === 'product' ? productPerformanceWithStores : collectionPerformanceWithStores}
                viewType={productViewType}
            />

            <ProductTrendsChart
                productData={productTrends}
                collectionData={collectionTrends}
                viewType={productViewType}
            />

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attribute Type
                </label>
                <div className="flex gap-2">
                    {(['color', 'material'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setAttributeType(type)}
                            className={`px-4 py-2 rounded-md text-sm ${attributeType === type
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <AttributeTrendsChart
                data={attributeType === 'color' ? colorTrends : materialTrends}
                attribute={attributeType}
            />
        </div>
    );
}


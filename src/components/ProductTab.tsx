import { useState } from 'react';

import { AttributeTrendsChart } from './AttributeTrends';
import { ProductPerformanceChart } from './ProductPerformance';
import { ProductTrendsChart } from './ProductTrendsChart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

import type { AttributeTrend, PerformanceWithStoreBreakdown, ProductTrend, CollectionTrend } from '../types';
import type { Granularity } from '../utils/dataAnalysis';

type ViewType = 'product' | 'collection' | 'color' | 'material';

interface ProductTabProps {
    productTrendsWeekly: ProductTrend[];
    productTrendsMonthly: ProductTrend[];
    collectionTrendsWeekly: CollectionTrend[];
    collectionTrendsMonthly: CollectionTrend[];
    productPerformanceWithStores: PerformanceWithStoreBreakdown[];
    collectionPerformanceWithStores: PerformanceWithStoreBreakdown[];
    colorPerformanceWithStores: PerformanceWithStoreBreakdown[];
    materialPerformanceWithStores: PerformanceWithStoreBreakdown[];
    colorTrends: AttributeTrend[];
    materialTrends: AttributeTrend[];
}

export function ProductTab({
    productTrendsWeekly,
    productTrendsMonthly,
    collectionTrendsWeekly,
    collectionTrendsMonthly,
    productPerformanceWithStores,
    collectionPerformanceWithStores,
    colorPerformanceWithStores,
    materialPerformanceWithStores,
    colorTrends,
    materialTrends,
}: ProductTabProps) {
    const [viewType, setViewType] = useState<ViewType>('product');
    const [granularity, setGranularity] = useState<Granularity>('monthly');

    const viewTypeLabels: Record<ViewType, string> = {
        product: 'Product',
        collection: 'Collection',
        color: 'Color',
        material: 'Material',
    };

    // Determine which data to show based on view type
    const performanceData = viewType === 'product'
        ? productPerformanceWithStores
        : viewType === 'collection'
            ? collectionPerformanceWithStores
            : viewType === 'color'
                ? colorPerformanceWithStores
                : materialPerformanceWithStores;

    // Get trends data based on view type and granularity
    const getTrendsData = () => {
        if (viewType === 'product') {
            return granularity === 'weekly'
                ? productTrendsWeekly
                : productTrendsMonthly;
        } else if (viewType === 'collection') {
            return granularity === 'weekly'
                ? collectionTrendsWeekly
                : collectionTrendsMonthly;
        } else {
            return viewType === 'color' ? colorTrends : materialTrends;
        }
    };

    const trendsData = getTrendsData();

    return (
        <div className="space-y-8">
            {/* Performance Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Top 25 {viewTypeLabels[viewType]}s Performance by Store
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">View:</span>
                            <ToggleGroup
                                type="single"
                                value={viewType}
                                onValueChange={(value) => value && setViewType(value as ViewType)}
                            >
                                {(['product', 'collection', 'color', 'material'] as ViewType[]).map((type) => (
                                    <ToggleGroupItem
                                        key={type}
                                        value={type}
                                        aria-label={`${type} view`}
                                    >
                                        {viewTypeLabels[type]}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ProductPerformanceChart
                        data={performanceData}
                        viewType={viewType === 'product' ? 'product' : viewType === 'collection' ? 'collection' : 'product'}
                    />
                </CardContent>
            </Card>

            {/* Trends Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            {viewTypeLabels[viewType]} Trends Over Time
                        </CardTitle>
                        {(viewType === 'product' || viewType === 'collection') && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
                                <ToggleGroup
                                    type="single"
                                    value={granularity}
                                    onValueChange={(value) => value && setGranularity(value as Granularity)}
                                >
                                    {(['weekly', 'monthly'] as Granularity[]).map((g) => (
                                        <ToggleGroupItem
                                            key={g}
                                            value={g}
                                            aria-label={`${g} granularity`}
                                        >
                                            {g.charAt(0).toUpperCase() + g.slice(1)}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {(viewType === 'product' || viewType === 'collection') ? (
                        <ProductTrendsChart
                            productData={granularity === 'weekly' ? productTrendsWeekly : productTrendsMonthly}
                            collectionData={granularity === 'weekly' ? collectionTrendsWeekly : collectionTrendsMonthly}
                            viewType={viewType as 'product' | 'collection'}
                            granularity={granularity}
                        />
                    ) : (
                        <AttributeTrendsChart
                            data={trendsData as AttributeTrend[]}
                            attribute={viewType as 'color' | 'material'}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


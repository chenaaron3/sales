import type { PerformanceWithStoreBreakdown, StoreTrend } from '../types';
import { StorePerformanceChart } from './StorePerformance';
import { StoreTrendsChart } from './StoreTrendsChart';

interface StoresTabProps {
    storePerformanceWithProducts: PerformanceWithStoreBreakdown[];
    storeTrends: StoreTrend[];
}

export function StoresTab({
    storePerformanceWithProducts,
    storeTrends,
}: StoresTabProps) {
    return (
        <div className="space-y-8">
            <StorePerformanceChart data={storePerformanceWithProducts} />
            <StoreTrendsChart data={storeTrends} />
        </div>
    );
}


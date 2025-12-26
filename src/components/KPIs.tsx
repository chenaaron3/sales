import { KPICard } from './KPICard';

import type { KPIMetrics } from '../types';

interface KPIsProps {
    metrics: KPIMetrics;
}

export function KPIs({ metrics }: KPIsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
                title="Total Revenue"
                value={metrics.totalRevenue}
                format="currency"
            />
            <KPICard
                title="Total Transactions"
                value={metrics.totalTransactions}
                format="number"
            />
            <KPICard
                title="Average Order Value"
                value={metrics.averageOrderValue}
                format="currency"
            />
            <KPICard
                title="Active Customers"
                value={metrics.activeCustomers}
                format="number"
            />
        </div>
    );
}

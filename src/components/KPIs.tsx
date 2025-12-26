import { useTranslation } from 'react-i18next';
import { KPICard } from './KPICard';

import type { KPIMetrics } from '../types';

interface KPIsProps {
    metrics: KPIMetrics;
}

export function KPIs({ metrics }: KPIsProps) {
    const { t } = useTranslation();
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
                title={t('kpis.totalRevenue')}
                value={metrics.totalRevenue}
                format="currency"
            />
            <KPICard
                title={t('kpis.totalTransactions')}
                value={metrics.totalTransactions}
                format="number"
            />
            <KPICard
                title={t('kpis.averageOrderValue')}
                value={metrics.averageOrderValue}
                format="currency"
            />
            <KPICard
                title={t('kpis.activeCustomers')}
                value={metrics.activeCustomers}
                format="number"
            />
        </div>
    );
}

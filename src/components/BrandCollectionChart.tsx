import { useTranslation } from 'react-i18next';
import {
    Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

import { formatCurrency, formatNumber } from '../utils/i18n';
import { SEGMENT_COLORS } from '../utils/chartColors';
import type { BrandCollectionPerformance } from '../types';

interface BrandCollectionChartProps {
    data: BrandCollectionPerformance[];
    metric: 'revenue' | 'quantity' | 'transactions';
    type: 'brand' | 'collection';
}

const COLORS = SEGMENT_COLORS;

export function BrandCollectionChart({ data, metric, type }: BrandCollectionChartProps) {
    const { t } = useTranslation();

    if (data.length === 0) {
        return (
            <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-8">
                <p className="text-muted-foreground">{t('charts.noDataAvailable')}</p>
            </div>
        );
    }

    const top10 = data.slice(0, 10);

    const chartData = top10.map((item) => ({
        name: item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name,
        fullName: item.name,
        revenue: item.revenue,
        quantity: item.quantity,
        transactions: item.transactions,
        averagePrice: item.averagePrice,
        productCount: item.productCount,
    }));

    const formatValue = (value: number) => {
        if (metric === 'revenue') {
            return formatCurrency(value);
        }
        return formatNumber(value);
    };

    const title = type === 'brand' 
        ? t('brandCollection.topBrands') 
        : t('brandCollection.topCollections');

    return (
        <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-8">
            <h2 className="text-xl font-bold text-card-foreground mb-4">
                {title} ({t(`charts.${metric}`)})
            </h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatValue(value)} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number | undefined) => value !== undefined ? formatValue(value) : ''}
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
                    <Bar dataKey={metric} fill={COLORS[0]} name={t(`charts.${metric}`)}>
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {top10.slice(0, 4).map((item, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg border border-border">
                        <div className="font-semibold text-card-foreground text-xs mb-1">
                            {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {formatNumber(item.productCount)} {t('charts.products')} • {t('charts.avg')}: {formatCurrency(Math.round(item.averagePrice))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

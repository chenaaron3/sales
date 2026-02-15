import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { formatCurrency, formatNumber } from '../utils/i18n';
import { SEGMENT_COLORS } from '../utils/chartColors';
import type { CustomerSegment } from '../types';

interface CustomerSegmentsProps {
    data: CustomerSegment[];
}

export function CustomerSegmentsChart({ data }: CustomerSegmentsProps) {
    const { t } = useTranslation();
    const COLORS = SEGMENT_COLORS;

    const chartData = data.map((segment, index) => ({
        ...segment,
        fill: COLORS[index % COLORS.length],
    }));

    return (
        <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-8">
            <h2 className="text-xl font-bold text-card-foreground mb-4">
                {t('segmentation.lifetimeValueTitle')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => `${entry.segment}: ${entry.percentage.toFixed(1)}%`}
                            outerRadius={100}
                            fill={COLORS[0]}
                            dataKey="count"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                    {chartData.map((segment, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: segment.fill }}
                                />
                                <h3 className="font-semibold text-card-foreground">
                                    {segment.segment}
                                </h3>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <div>{t('charts.count')} {formatNumber(segment.count)}</div>
                                <div>{t('charts.totalRevenue')} {formatCurrency(segment.totalRevenue)}</div>
                                <div>{t('charts.avgPerCustomer')} {formatCurrency(Math.round(segment.averageRevenue))}</div>
                                <div>{t('charts.percentage')} {segment.percentage.toFixed(1)}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

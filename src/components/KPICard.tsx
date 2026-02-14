import { formatCurrency, formatNumber, getLocale } from '../utils/i18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface KPICardProps {
    title: string;
    value: number | string;
    format?: 'currency' | 'number' | 'decimal';
    trend?: number;
}

export function KPICard({ title, value, format = 'number', trend }: KPICardProps) {
    const formatValue = (val: number | string) => {
        if (typeof val === 'string') return val;

        const locale = getLocale();
        switch (format) {
            case 'currency':
                return formatCurrency(val);
            case 'decimal':
                return val.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            default:
                return formatNumber(val);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-5">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="py-5 pt-0">
                <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold text-card-foreground">
                        {formatValue(value)}
                    </p>
                    {trend !== undefined && (
                        <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

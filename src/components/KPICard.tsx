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

        switch (format) {
            case 'currency':
                return `¥${val.toLocaleString('ja-JP')}`;
            case 'decimal':
                return val.toFixed(2);
            default:
                return val.toLocaleString('ja-JP');
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline justify-between">
                    <p className="text-3xl font-bold">
                        {formatValue(value)}
                    </p>
                    {trend !== undefined && (
                        <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

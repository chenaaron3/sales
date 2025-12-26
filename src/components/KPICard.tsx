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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
            <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatValue(value)}
                </p>
                {trend !== undefined && (
                    <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                    </span>
                )}
            </div>
        </div>
    );
}

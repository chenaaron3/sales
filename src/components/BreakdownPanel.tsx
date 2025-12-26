interface BreakdownItem {
    name: string;
    revenue: number;
}

interface BreakdownPanelProps {
    title: string;
    totalRevenue: number;
    items: BreakdownItem[];
    itemColors: string[];
    itemList: string[]; // List of all items for color lookup
    emptyMessage: {
        primary: string;
        secondary: string;
    };
    itemLabel: string; // e.g., "Store Breakdown:", "Product Breakdown:"
}

export function BreakdownPanel({
    title,
    totalRevenue,
    items,
    itemColors,
    itemList,
    emptyMessage,
    itemLabel,
}: BreakdownPanelProps) {
    return (
        <div className="w-80 shrink-0">
            <div className="sticky top-4 bg-card border border-border rounded-lg p-6 shadow-md min-h-[200px]">
                {items && items.length > 0 ? (
                    <>
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            {title}
                        </h3>
                        <div className="mb-6 pb-4 border-b border-border">
                            <div className="text-sm text-muted-foreground mb-1">
                                Total Revenue
                            </div>
                            <div className="text-xl font-bold text-foreground">
                                ¥{totalRevenue.toLocaleString('ja-JP')}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-foreground mb-3">
                                {itemLabel}
                            </p>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                {items
                                    .sort((a, b) => b.revenue - a.revenue)
                                    .map((item) => {
                                        const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
                                        const colorIndex = itemList.indexOf(item.name);
                                        return (
                                            <div
                                                key={item.name}
                                                className="flex items-start gap-3 p-2.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                                            >
                                                <div
                                                    className="w-4 h-4 rounded shrink-0 border border-border/50 mt-0.5"
                                                    style={{
                                                        backgroundColor:
                                                            itemColors[colorIndex % itemColors.length],
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-foreground break-words">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {percentage > 0 && `${percentage.toFixed(1)}% of total`}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-semibold text-foreground shrink-0 ml-2">
                                                    ¥{item.revenue.toLocaleString('ja-JP')}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground font-medium">
                                {emptyMessage.primary}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {emptyMessage.secondary}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


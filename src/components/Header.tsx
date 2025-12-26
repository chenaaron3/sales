import { motion } from 'framer-motion';

type TabType = 'customers' | 'product' | 'temporal' | 'stores' | 'employees';

interface HeaderProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
    const tabs: { id: TabType; label: string }[] = [
        { id: 'customers', label: 'Customers' },
        { id: 'product', label: 'Product' },
        { id: 'stores', label: 'Stores' },
        { id: 'employees', label: 'Employees' },
        { id: 'temporal', label: 'Time' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="container flex h-16 items-center justify-between px-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Jouete Sales
                </h1>
                <nav className="relative flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className="relative px-4 py-2 text-sm font-medium transition-colors rounded-md z-10"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30
                                        }}
                                    />
                                )}
                                <span className={`relative z-10 ${isActive
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}


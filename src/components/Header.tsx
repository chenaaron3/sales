import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from './LanguageSwitcher';

type TabType = 'customers' | 'product' | 'sales' | 'stores' | 'employees';

interface HeaderProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
    const { t } = useTranslation();

    const tabs: { id: TabType; labelKey: string }[] = [
        { id: 'sales', labelKey: 'header.tabs.sales' },
        { id: 'customers', labelKey: 'header.tabs.customers' },
        { id: 'product', labelKey: 'header.tabs.product' },
        { id: 'stores', labelKey: 'header.tabs.stores' },
        { id: 'employees', labelKey: 'header.tabs.employees' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full">
            <div className="container mx-auto mt-4">
                <div className="flex h-16 items-center px-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white flex-shrink-0">
                        {t('header.title')}
                    </h1>
                    <nav className="relative flex items-center gap-2 flex-1 justify-center">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className="relative px-5 py-2.5 text-sm font-medium transition-all duration-200 rounded-full z-10"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gray-900 dark:bg-gray-100 rounded-full shadow-md"
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 30
                                            }}
                                        />
                                    )}
                                    <span className={`relative z-10 transition-colors duration-200 ${isActive
                                        ? 'text-white dark:text-gray-900'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}>
                                        {t(tab.labelKey)}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                    <div className="flex-shrink-0 ml-4">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </header>
    );
}


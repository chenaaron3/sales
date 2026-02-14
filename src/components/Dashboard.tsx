import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { loadPrecomputedData } from '../utils/precomputedDataLoader';
import { CustomersTab } from './CustomersTab';
import { EmployeesTab } from './EmployeesTab';
import { KPIs } from './KPIs';
import { Navbar } from './Navbar';
import { ProductTab } from './ProductTab';
import { Sidebar, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from './Sidebar';
import { StoresTab } from './StoresTab';
import { TemporalTab } from './TemporalTab';

type TabType = 'customers' | 'product' | 'sales' | 'stores' | 'employees';
export function Dashboard() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('sales');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [precomputedData, setPrecomputedData] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                console.log('🚀 Dashboard: Loading precomputed data...');
                const data = await loadPrecomputedData();
                console.log('✅ Dashboard: Precomputed data loaded, rendering charts');
                setPrecomputedData(data);
                setLoading(false);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load precomputed data';
                console.error('❌ Dashboard: Error loading precomputed data:', err);
                setError(errorMessage);
                setLoading(false);
            }
        }

        loadData();
    }, []);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">{t('common.error')}: {error}</p>
                    <p className="text-muted-foreground">{t('common.checkConsole')}</p>
                </div>
            </div>
        );
    }

    if (!precomputedData) {
        return null;
    }

    // Use precomputed data directly
    const {
        kpis,
        trendDataDaily,
        trendDataWeekly,
        trendDataMonthly,
        birthdayDataCustomer,
        birthdayDataImportantPerson,
        anniversaryData,
        dayOfWeekData,
        colorTrends,
        materialTrends,
        customerSegments,
        productTrendsWeekly,
        productTrendsMonthly,
        collectionTrendsWeekly,
        collectionTrendsMonthly,
        categoryTrendsWeekly,
        categoryTrendsMonthly,
        productPerformanceWithStores,
        collectionPerformanceWithStores,
        categoryPerformanceWithStores,
        colorPerformanceWithStores,
        materialPerformanceWithStores,
        storePerformanceWithProducts,
        storeTrendsWeekly,
        storeTrendsMonthly,
        rfmMatrix,
        frequencySegments,
        ageSegments,
        genderSegments,
        channelSegments,
        aovSegments,
        employeePerformance,
    } = precomputedData;

    const mainMarginLeft = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
            />
            <main
                className="flex flex-col min-h-screen min-w-0 transition-[margin] duration-200"
                style={{ marginLeft: mainMarginLeft }}
            >
                <Navbar />
                <div className="flex-1 p-6 lg:p-8 overflow-auto">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-1">
                            {t('dashboard.welcome')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t('dashboard.welcomeSub')}
                        </p>
                    </section>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'sales' && (
                                <>
                                    <KPIs metrics={kpis} />
                                    <TemporalTab
                                        birthdayDataCustomer={birthdayDataCustomer}
                                        birthdayDataImportantPerson={birthdayDataImportantPerson}
                                        anniversaryData={anniversaryData}
                                        dayOfWeekData={dayOfWeekData}
                                        trendDataDaily={trendDataDaily}
                                        trendDataWeekly={trendDataWeekly}
                                        trendDataMonthly={trendDataMonthly}
                                    />
                                </>
                            )}

                            {activeTab === 'customers' && (
                                <CustomersTab
                                    rfmMatrix={rfmMatrix}
                                    frequencySegments={frequencySegments}
                                    ageSegments={ageSegments}
                                    genderSegments={genderSegments}
                                    channelSegments={channelSegments}
                                    aovSegments={aovSegments}
                                    lifetimeValueSegments={customerSegments}
                                />
                            )}

                            {activeTab === 'product' && (
                                <ProductTab
                                    productTrendsWeekly={productTrendsWeekly}
                                    productTrendsMonthly={productTrendsMonthly}
                                    collectionTrendsWeekly={collectionTrendsWeekly}
                                    collectionTrendsMonthly={collectionTrendsMonthly}
                                    categoryTrendsWeekly={categoryTrendsWeekly}
                                    categoryTrendsMonthly={categoryTrendsMonthly}
                                    productPerformanceWithStores={productPerformanceWithStores}
                                    collectionPerformanceWithStores={collectionPerformanceWithStores}
                                    categoryPerformanceWithStores={categoryPerformanceWithStores}
                                    colorPerformanceWithStores={colorPerformanceWithStores}
                                    materialPerformanceWithStores={materialPerformanceWithStores}
                                    colorTrends={colorTrends}
                                    materialTrends={materialTrends}
                                />
                            )}

                            {activeTab === 'stores' && (
                                <StoresTab
                                    storePerformanceWithProducts={storePerformanceWithProducts}
                                    storeTrendsWeekly={storeTrendsWeekly}
                                    storeTrendsMonthly={storeTrendsMonthly}
                                />
                            )}

                            {activeTab === 'employees' && (
                                <EmployeesTab
                                    employeePerformance={employeePerformance}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

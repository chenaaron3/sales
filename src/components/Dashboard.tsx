import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { loadPrecomputedData } from '../utils/precomputedDataLoader';
import { CustomersTab } from './CustomersTab';
import { Header } from './Header';
import { KPIs } from './KPIs';
import { ProductTab } from './ProductTab';
import { StoresTab } from './StoresTab';
import { TemporalTab } from './TemporalTab';

type TabType = 'customers' | 'product' | 'temporal' | 'stores';
export function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('customers');
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading sales data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
                    <p className="text-gray-600 dark:text-gray-400">Please check the console for details.</p>
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
        dayOfWeekData,
        colorTrends,
        materialTrends,
        customerSegments,
        productTrendsWeekly,
        productTrendsMonthly,
        collectionTrendsWeekly,
        collectionTrendsMonthly,
        productPerformanceWithStores,
        collectionPerformanceWithStores,
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
    } = precomputedData;

    return (
        <div className="min-h-screen bg-background">
            <Header activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="container py-8">
                <div className="mx-auto">
                    <KPIs metrics={kpis} />

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="mt-8"
                        >
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
                                    productPerformanceWithStores={productPerformanceWithStores}
                                    collectionPerformanceWithStores={collectionPerformanceWithStores}
                                    colorPerformanceWithStores={colorPerformanceWithStores}
                                    materialPerformanceWithStores={materialPerformanceWithStores}
                                    colorTrends={colorTrends}
                                    materialTrends={materialTrends}
                                />
                            )}

                            {activeTab === 'temporal' && (
                                <TemporalTab
                                    birthdayDataCustomer={birthdayDataCustomer}
                                    birthdayDataImportantPerson={birthdayDataImportantPerson}
                                    dayOfWeekData={dayOfWeekData}
                                    trendDataDaily={trendDataDaily}
                                    trendDataWeekly={trendDataWeekly}
                                    trendDataMonthly={trendDataMonthly}
                                />
                            )}

                            {activeTab === 'stores' && (
                                <StoresTab
                                    storePerformanceWithProducts={storePerformanceWithProducts}
                                    storeTrendsWeekly={storeTrendsWeekly}
                                    storeTrendsMonthly={storeTrendsMonthly}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

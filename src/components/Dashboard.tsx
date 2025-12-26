import { useEffect, useState } from 'react';

import { loadPrecomputedData } from '../utils/precomputedDataLoader';
import { CustomersTab } from './CustomersTab';
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
        productTrends,
        collectionTrends,
        productPerformanceWithStores,
        collectionPerformanceWithStores,
        storePerformanceWithProducts,
        storeTrends,
        rfmSegments,
        frequencySegments,
        recencySegments,
        channelSegments,
        aovSegments,
    } = precomputedData;

    const tabs: { id: TabType; label: string }[] = [
        { id: 'customers', label: 'Customers' },
        { id: 'product', label: 'Product' },
        { id: 'stores', label: 'Stores' },
        { id: 'temporal', label: 'Time' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Sales Dashboard
                </h1>

                <KPIs metrics={kpis} />

                {/* Tab Navigation */}
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === 'customers' && (
                        <CustomersTab
                            rfmSegments={rfmSegments}
                            frequencySegments={frequencySegments}
                            recencySegments={recencySegments}
                            channelSegments={channelSegments}
                            aovSegments={aovSegments}
                            lifetimeValueSegments={customerSegments}
                        />
                    )}

                    {activeTab === 'product' && (
                        <ProductTab
                            productTrends={productTrends}
                            collectionTrends={collectionTrends}
                            productPerformanceWithStores={productPerformanceWithStores}
                            collectionPerformanceWithStores={collectionPerformanceWithStores}
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
                            storeTrends={storeTrends}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

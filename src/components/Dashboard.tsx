import { useEffect, useState } from 'react';

import {
    calculateKPIs, getAOVSegments, getAttributeTrends, getBirthdaySalesCorrelation,
    getChannelSegments, getCollectionPerformanceWithStores, getCollectionTrends,
    getCustomerSegments, getDayOfWeekAnalysis, getFrequencySegments,
    getProductPerformanceWithStores, getProductTrends, getRecencySegments, getRFMSegments,
    getStorePerformanceWithProducts, getStoreTrends, getTrendsByGranularity
} from '../utils/dataAnalysis';
import { loadMemberData, loadSalesData } from '../utils/dataParser';
import { CustomersTab } from './CustomersTab';
import { KPIs } from './KPIs';
import { ProductTab } from './ProductTab';
import { StoresTab } from './StoresTab';
import { TemporalTab } from './TemporalTab';

import type { MemberRecord, SalesRecord } from '../types';

type TabType = 'customers' | 'product' | 'temporal' | 'stores';
export function Dashboard() {
    const [salesData, setSalesData] = useState<SalesRecord[]>([]);
    const [memberData, setMemberData] = useState<MemberRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('customers');

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [sales, members] = await Promise.all([
                    loadSalesData(),
                    loadMemberData(),
                ]);

                setSalesData(sales as SalesRecord[]);
                setMemberData(members as MemberRecord[]);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
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

    // Filter data - default to Q3 2024 onwards
    const filteredData = salesData.filter((record) => {
        if (!record.purchaseDate) return false;
        // Filter for Q3 2024 onwards
        if (record.purchaseDate < '2024-07-01') return false;
        // Only count sales
        if (record.transactionType !== '売上' || record.amount <= 0) return false;
        return true;
    });

    const kpis = calculateKPIs(filteredData);
    const trendData = getTrendsByGranularity(filteredData, 'monthly');
    const birthdayData = getBirthdaySalesCorrelation(filteredData, memberData, 30, 'importantPerson');
    const colorTrends = getAttributeTrends(filteredData, 'color', 'monthly');
    const materialTrends = getAttributeTrends(filteredData, 'material', 'monthly');
    const customerSegments = getCustomerSegments(filteredData);
    const dayOfWeekData = getDayOfWeekAnalysis(filteredData);
    const productTrends = getProductTrends(filteredData, 10, 'monthly');
    const collectionTrends = getCollectionTrends(filteredData, 10, 'monthly');
    const productPerformanceWithStores = getProductPerformanceWithStores(filteredData, 10);
    const collectionPerformanceWithStores = getCollectionPerformanceWithStores(filteredData, 10);
    const storePerformanceWithProducts = getStorePerformanceWithProducts(filteredData, 10);
    const storeTrends = getStoreTrends(filteredData, 10, 'monthly');

    // Advanced segmentation
    const rfmSegments = getRFMSegments(filteredData);
    const frequencySegments = getFrequencySegments(filteredData);
    const recencySegments = getRecencySegments(filteredData);
    const channelSegments = getChannelSegments(filteredData);
    const aovSegments = getAOVSegments(filteredData);

    const tabs: { id: TabType; label: string }[] = [
        { id: 'customers', label: 'Customers (Who)' },
        { id: 'product', label: 'Product (What)' },
        { id: 'temporal', label: 'Temporal (When)' },
        { id: 'stores', label: 'Stores (Where)' },
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
                            birthdayData={birthdayData}
                            dayOfWeekData={dayOfWeekData}
                            trendData={trendData}
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

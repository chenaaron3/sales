import { useEffect, useState } from 'react';

import {
    calculateKPIs, getAOVSegments, getAttributeTrends, getBirthdaySalesCorrelation,
    getCategorySalesOverTime, getChannelSegments, getCustomerSegments, getDayOfWeekAnalysis,
    getFrequencySegments, getRecencySegments, getRFMSegments, getStorePerformance, getTopProducts,
    getTrendsByGranularity
} from '../utils/dataAnalysis';
import { loadMemberData, loadSalesData } from '../utils/dataParser';
import {
    getAcquisitionMetrics, getBasketAnalysis, getChurnMetrics, getCohortAnalysis,
    getFirstPurchaseAnalysis, getFirstRepeatAnalysis, getLTVAnalysis, getProductAffinity,
    getPurchaseCycleSegments, getPurchaseIntervalDistribution, getPurchaseIntervals
} from '../utils/funnelAnalysis';
import { AdvancedCustomerSegmentation } from './AdvancedCustomerSegmentation';
import { AttributeTrendsChart } from './AttributeTrends';
import { BirthdayHeatMap } from './BirthdayHeatMap';
import { CategorySalesChart } from './CategorySalesChart';
import { DayOfWeekAnalysisChart } from './DayOfWeekAnalysis';
import { KPIs } from './KPIs';
import { ProductPerformanceChart } from './ProductPerformance';
import { StorePerformanceChart } from './StorePerformance';
import { TrendChart } from './TrendChart';

import type { BirthdayType } from '../utils/dataAnalysis';
import type { MemberRecord, SalesRecord } from '../types';

type TabType = 'customers' | 'product' | 'temporal' | 'stores' | 'funnel';
export function Dashboard() {
    const [salesData, setSalesData] = useState<SalesRecord[]>([]);
    const [memberData, setMemberData] = useState<MemberRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('customers');
    const [birthdayMetric, setBirthdayMetric] = useState<'salesCount' | 'revenue' | 'transactions'>('revenue');
    const [birthdayType, setBirthdayType] = useState<BirthdayType>('importantPerson');
    const [productMetric, setProductMetric] = useState<'revenue' | 'quantity' | 'transactions'>('revenue');
    const [attributeType, setAttributeType] = useState<'color' | 'material'>('color');
    const [dayOfWeekMetric, setDayOfWeekMetric] = useState<'revenue' | 'transactions' | 'customers'>('revenue');

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
    const categoryData = getCategorySalesOverTime(filteredData, 'monthly');
    const trendData = getTrendsByGranularity(filteredData, 'monthly');
    const birthdayData = getBirthdaySalesCorrelation(filteredData, memberData, 30, birthdayType);
    const topProducts = getTopProducts(filteredData, 20);
    const storePerformance = getStorePerformance(filteredData);
    const colorTrends = getAttributeTrends(filteredData, 'color', 'monthly');
    const materialTrends = getAttributeTrends(filteredData, 'material', 'monthly');
    const customerSegments = getCustomerSegments(filteredData);
    const dayOfWeekData = getDayOfWeekAnalysis(filteredData);

    // Advanced segmentation
    const rfmSegments = getRFMSegments(filteredData);
    const frequencySegments = getFrequencySegments(filteredData);
    const recencySegments = getRecencySegments(filteredData);
    const channelSegments = getChannelSegments(filteredData);
    const aovSegments = getAOVSegments(filteredData);

    // Funnel analysis
    const acquisitionMetrics = getAcquisitionMetrics(filteredData, 'monthly');
    const firstPurchaseAnalysis = getFirstPurchaseAnalysis(filteredData);
    const purchaseIntervals = getPurchaseIntervals(filteredData);
    const intervalDistribution = getPurchaseIntervalDistribution(purchaseIntervals);
    const cycleSegments = getPurchaseCycleSegments(purchaseIntervals, filteredData);
    const firstRepeatAnalysis = getFirstRepeatAnalysis(filteredData);
    const baskets = getBasketAnalysis(filteredData);
    const productAffinity = getProductAffinity(baskets, 5);
    const cohortAnalysis = getCohortAnalysis(filteredData);
    const ltvAnalysis = getLTVAnalysis(filteredData, 'monthly');
    const churnMetrics = getChurnMetrics(filteredData, 'monthly');

    const tabs: { id: TabType; label: string }[] = [
        { id: 'customers', label: 'Customers (Who)' },
        { id: 'product', label: 'Product (What)' },
        { id: 'temporal', label: 'Temporal (When)' },
        { id: 'stores', label: 'Stores (Where)' },
        { id: 'funnel', label: 'Funnel (Journey)' },
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
                        <div>
                            <AdvancedCustomerSegmentation
                                rfmSegments={rfmSegments}
                                frequencySegments={frequencySegments}
                                recencySegments={recencySegments}
                                channelSegments={channelSegments}
                                aovSegments={aovSegments}
                                lifetimeValueSegments={customerSegments}
                            />
                        </div>
                    )}

                    {activeTab === 'product' && (
                        <div className="space-y-8">
                            <CategorySalesChart data={categoryData} />

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Product Metric
                                </label>
                                <div className="flex gap-2 mb-4">
                                    {(['revenue', 'quantity', 'transactions'] as const).map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setProductMetric(m)}
                                            className={`px-4 py-2 rounded-md text-sm ${productMetric === m
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                                }`}
                                        >
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <ProductPerformanceChart data={topProducts} metric={productMetric} />

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Attribute Type
                                </label>
                                <div className="flex gap-2">
                                    {(['color', 'material'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setAttributeType(type)}
                                            className={`px-4 py-2 rounded-md text-sm ${attributeType === type
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <AttributeTrendsChart
                                data={attributeType === 'color' ? colorTrends : materialTrends}
                                attribute={attributeType}
                            />
                        </div>
                    )}

                    {activeTab === 'temporal' && (
                        <div className="space-y-8">
                            <BirthdayHeatMap
                                data={birthdayData}
                                metric={birthdayMetric}
                                birthdayType={birthdayType}
                                onMetricChange={setBirthdayMetric}
                                onBirthdayTypeChange={setBirthdayType}
                            />

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Day of Week Metric
                                </label>
                                <div className="flex gap-2">
                                    {(['revenue', 'transactions', 'customers'] as const).map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setDayOfWeekMetric(m)}
                                            className={`px-4 py-2 rounded-md text-sm ${dayOfWeekMetric === m
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                                }`}
                                        >
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <DayOfWeekAnalysisChart data={dayOfWeekData} metric={dayOfWeekMetric} />

                            <TrendChart data={trendData} granularity="monthly" />
                        </div>
                    )}

                    {activeTab === 'stores' && (
                        <div>
                            <StorePerformanceChart data={storePerformance} />
                        </div>
                    )}

                    {activeTab === 'funnel' && (
                        <div className="space-y-8">
                            {/* Acquisition Metrics */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Acquisition Metrics
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Total New Customers</div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {acquisitionMetrics.reduce((sum, m) => sum + m.newCustomers, 0).toLocaleString('ja-JP')}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg First Purchase Value</div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ¥{Math.round(firstPurchaseAnalysis.averageFirstPurchaseValue).toLocaleString('ja-JP')}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Second Purchase Rate</div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {firstRepeatAnalysis.secondPurchaseRate.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <p><strong>Key Insight:</strong> {firstRepeatAnalysis.secondPurchaseRate.toFixed(1)}% of customers make a second purchase.
                                        Focus on converting first-time buyers within {Math.round(firstRepeatAnalysis.averageDaysToSecondPurchase)} days.</p>
                                </div>
                            </div>

                            {/* Purchase Intervals */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Purchase Cycle Analysis
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    {cycleSegments.map((segment, index) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{segment.segment}</div>
                                            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                                {segment.count.toLocaleString('ja-JP')}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {segment.percentage.toFixed(1)}% • Avg {Math.round(segment.averageInterval)} days
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Avg Revenue: ¥{Math.round(segment.averageRevenue).toLocaleString('ja-JP')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <p><strong>Distribution:</strong> {intervalDistribution.map(d => `${d.intervalRange}: ${d.percentage.toFixed(1)}%`).join(' • ')}</p>
                                </div>
                            </div>

                            {/* Top Product Affinities */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Top Product Affinities (Frequently Bought Together)
                                </h2>
                                <div className="space-y-2">
                                    {productAffinity.slice(0, 10).map((affinity, index) => (
                                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {affinity.productA.length > 40 ? affinity.productA.substring(0, 40) + '...' : affinity.productA}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    + {affinity.productB.length > 40 ? affinity.productB.substring(0, 40) + '...' : affinity.productB}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                                    {affinity.confidence.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    {affinity.coOccurrence} times
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cohort Analysis Summary */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Cohort Analysis Summary
                                </h2>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Showing {cohortAnalysis.length} acquisition cohorts
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {cohortAnalysis.slice(-6).map((cohort, index) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="font-semibold text-gray-900 dark:text-white mb-2">{cohort.cohort}</div>
                                            <div className="text-sm space-y-1">
                                                <div>Customers: <span className="font-medium">{cohort.customers.toLocaleString('ja-JP')}</span></div>
                                                <div>Avg LTV: <span className="font-medium">¥{Math.round(cohort.averageLTV).toLocaleString('ja-JP')}</span></div>
                                                <div>Retention: <span className="font-medium">{cohort.retentionRate.toFixed(1)}%</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* LTV Trends */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Lifetime Value Trends
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {ltvAnalysis.slice(-6).map((ltv, index) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{ltv.period}</div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                ¥{Math.round(ltv.averageLTV).toLocaleString('ja-JP')}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Median: ¥{Math.round(ltv.medianLTV).toLocaleString('ja-JP')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Churn Metrics */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Churn & Retention Metrics
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {churnMetrics.slice(-4).map((metric, index) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.period}</div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                                {metric.churnRate.toFixed(1)}% churn
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {metric.retentionRate.toFixed(1)}% retained • {metric.newCustomers} new
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

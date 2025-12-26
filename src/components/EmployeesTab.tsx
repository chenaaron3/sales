import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EmployeePerformanceChart } from './EmployeePerformanceChart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

import type { EmployeePerformance } from '../types';

interface EmployeesTabProps {
    employeePerformance: EmployeePerformance[];
}

const DEFAULT_ITEMS_PER_PAGE = 25;
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function EmployeesTab({ employeePerformance }: EmployeesTabProps) {
    const { t } = useTranslation();
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(DEFAULT_ITEMS_PER_PAGE);

    // Ensure employeePerformance is an array
    const safeData = Array.isArray(employeePerformance) ? employeePerformance : [];

    // Get all unique stores
    const allStores = useMemo(() => {
        const storeSet = new Set<string>();
        safeData.forEach((employee) => {
            if (employee.stores && Array.isArray(employee.stores)) {
                employee.stores.forEach((store) => storeSet.add(store));
            }
        });
        return Array.from(storeSet).sort();
    }, [safeData]);

    // Filter by store
    const filteredData = useMemo(() => {
        if (selectedStore === 'all') {
            return safeData;
        }
        return safeData.filter((employee) =>
            employee.stores && employee.stores.includes(selectedStore)
        );
    }, [safeData, selectedStore]);

    // Paginate
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, itemsPerPage]);

    // Reset to page 1 when filter or items per page changes
    const handleStoreChange = (store: string) => {
        setSelectedStore(store);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        const newItemsPerPage = parseInt(value, 10);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <CardTitle className="text-2xl">{t('employees.title')}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {t('employees.description')}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-700 dark:text-gray-300">{t('employees.store')}</label>
                                <select
                                    value={selectedStore}
                                    onChange={(e) => handleStoreChange(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">{t('employees.allStores')}</option>
                                    {allStores.map((store) => (
                                        <option key={store} value={store}>
                                            {store}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-700 dark:text-gray-300">{t('employees.perPage')}</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <EmployeePerformanceChart data={paginatedData} />

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {t('employees.showing', {
                                    start: ((currentPage - 1) * itemsPerPage) + 1,
                                    end: Math.min(currentPage * itemsPerPage, filteredData.length),
                                    total: filteredData.length
                                })}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('common.previous')}
                                </button>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    {t('common.page')} {currentPage} {t('common.of')} {totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('common.next')}
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


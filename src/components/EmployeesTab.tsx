import { useMemo, useState } from 'react';

import { EmployeePerformanceChart } from './EmployeePerformanceChart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

import type { EmployeePerformance } from '../types';

interface EmployeesTabProps {
    employeePerformance: EmployeePerformance[];
}

const ITEMS_PER_PAGE = 10;

export function EmployeesTab({ employeePerformance }: EmployeesTabProps) {
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

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
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage]);

    // Reset to page 1 when filter changes
    const handleStoreChange = (store: string) => {
        setSelectedStore(store);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <CardTitle className="text-2xl">Employee Sales Performance</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                All employees ranked by total sales revenue, with product breakdown
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm text-gray-700 dark:text-gray-300">Store:</label>
                            <select
                                value={selectedStore}
                                onChange={(e) => handleStoreChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Stores</option>
                                {allStores.map((store) => (
                                    <option key={store} value={store}>
                                        {store}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <EmployeePerformanceChart data={paginatedData} />

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} employees
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


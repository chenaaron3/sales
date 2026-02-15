/**
 * Data source identifier for CSV parsing and precomputation.
 * Allows switching between different upstream systems (e.g. brand A vs brand B)
 * while producing the same common data model for the dashboard.
 */
export type DataSourceId = "jouete" | "mark";

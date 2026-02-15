import { createContext, useContext, type ReactNode } from "react";
import type { DataSourceId } from "../utils/precomputedDataLoader";

const DataSourceContext = createContext<DataSourceId>("jouete");

export function DataSourceProvider({
  dataSource,
  children,
}: {
  dataSource: DataSourceId;
  children: ReactNode;
}) {
  return (
    <DataSourceContext.Provider value={dataSource}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource(): DataSourceId {
  return useContext(DataSourceContext);
}

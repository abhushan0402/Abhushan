import { useMemo, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

/**
 * Shared pagination/search/sort state + query wiring for any resource built with
 * `createResourceHooks`. Keeps every list page (Products, Orders, Customers, ...)
 * driven by the exact same GET-with-params contract.
 */
export function useServerTable(resourceHooks, { pageSize: initialPageSize = 10, sortBy, sortDir = "asc", extraParams = {} } = {}) {
  const [page, setPage] = useState(0); // MUI DataGrid is 0-indexed
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState("");
  const [sortModel, setSortModel] = useState(sortBy ? [{ field: sortBy, sort: sortDir }] : []);

  const debouncedSearch = useDebouncedValue(search, 300);

  const params = useMemo(() => {
    const sort = sortModel[0];
    return {
      page: page + 1,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy: sort?.field,
      sortDir: sort?.sort,
      ...extraParams,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch, sortModel, JSON.stringify(extraParams)]);

  const query = resourceHooks.useList(params, { placeholderData: (prev) => prev });

  return {
    rows: query.data?.data ?? [],
    rowCount: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    sortModel,
    setSortModel,
    refetch: query.refetch,
  };
}

import { useApiQuery } from "../../hooks/api/useApiQuery";

export function useDashboardSummary() {
  return useApiQuery(["dashboard", "summary"], "/dashboard");
}

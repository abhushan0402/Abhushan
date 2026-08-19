import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/apiClient";

/**
 * Generic GET hook. Use this directly for one-off endpoints (dashboard summary,
 * "me" profile, etc). For standard CRUD resources prefer `createResourceHooks`,
 * which builds list/detail/create/update/patch/remove hooks on top of this.
 */
export function useApiQuery(queryKey, url, config = {}, options = {}) {
  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(url, { ...config, signal });
      return response.data;
    },
    ...options,
  });
}

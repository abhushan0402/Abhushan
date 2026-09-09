import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

/**
 * Metal rates are live on the real API (see swagger: /api/admin/metal-rates).
 * Confirmed shape via the public GET /api/metal-rates/ (same underlying data):
 * { success, message, data: { gold24kPer10g, gold22kPer10g, silver9999PerKg, updatedAt } }.
 */
const keys = { detail: ["metalRates"] };

function useDetail(options) {
  return useQuery({
    queryKey: keys.detail,
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/admin/metal-rates", { signal });
      return body?.data;
    },
    ...options,
  });
}

// Body: { gold24kPer10g?, gold22kPer10g?, silver9999PerKg? } (all optional numbers).
function useUpdate(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data: body } = await httpClient.put("/admin/metal-rates", payload);
      return { ...body?.data, message: body?.message };
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(keys.detail, data);
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useMetalRates = { keys, useDetail, useUpdate };

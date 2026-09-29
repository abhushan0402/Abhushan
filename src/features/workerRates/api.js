import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

/**
 * Worker (making-charge) jewellery rates - see swagger: /api/admin/worker-rates.
 * The PUT body confirms the shape: { rates: [{ code, ratePerGram }], gstPercentage }.
 * GET's response schema isn't declared, so this reads defensively, assuming it
 * mirrors the PUT body - every other resource on this API follows that convention.
 */
export const RATE_CODES = [
  { code: "gold_adore", label: "Gold - Adore" },
  { code: "gold_riwaaz", label: "Gold - Riwaaz" },
  { code: "gold_cutting_casting", label: "Gold - Cutting & Casting" },
  { code: "gold_regular", label: "Gold - Regular" },
  { code: "gold_18k", label: "Gold - 18K" },
  { code: "gold_9k", label: "Gold - 9K" },
  { code: "silver_pure", label: "Silver - Pure" },
  { code: "silver_premium", label: "Silver - Premium" },
  { code: "silver_ring_bichiya", label: "Silver - Ring/Bichiya" },
  { code: "silver_60t", label: "Silver - 60T" },
];

const keys = { detail: ["workerRates"] };

function useDetail(options) {
  return useQuery({
    queryKey: keys.detail,
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get("/admin/worker-rates", { signal });
      const payload = body?.data ?? {};
      const rates = payload.rates ?? [];
      const rateByCode = Object.fromEntries(rates.map((r) => [r.code, r.ratePerGram]));
      return {
        rateByCode,
        gstPercentage: payload.gstPercentage ?? payload.gst ?? 3,
        updatedAt: payload.updatedAt,
      };
    },
    ...options,
  });
}

// Body: { rates?: [{ code, ratePerGram }] (1-10 items), gstPercentage? }.
function useUpdate(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data: body } = await httpClient.put("/admin/worker-rates", payload);
      return body;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.detail });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useWorkerRates = { keys, useDetail, useUpdate };

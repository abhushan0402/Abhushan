import { useQuery } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

/**
 * Reviews are live on the real API, but only per-product - GET /api/products/:id/reviews
 * (there's no "all reviews" endpoint), so `useList` requires a `productId` param and
 * simply doesn't fire until one is provided. Confirmed shape:
 * { success, message, data: { reviews: [...], pagination: { page, limit, total, totalPages } } }.
 *
 * POST (creating a review) is intentionally not wired here - it returned "Product not
 * found" for both a real and a fake product id when called with an admin token, which
 * points to it being customer-only rather than something this admin console can drive.
 */
const keys = {
  all: ["reviews"],
  lists: () => ["reviews", "list"],
  list: (params = {}) => ["reviews", "list", params],
};

// No sample review data exists yet to confirm field names, so this accepts the
// common conventions for reviewer/comment - verify once real reviews come in.
function normalizeReview(row) {
  if (!row) return row;
  return {
    ...row,
    id: row.id ?? row._id,
    reviewerName: row.userName ?? row.user?.name ?? row.name ?? row.customerName ?? "Anonymous",
    comment: row.comment ?? row.review ?? row.text ?? row.message ?? "",
  };
}

function normalizeList(body) {
  const payload = body?.data ?? {};
  const rows = payload.reviews ?? payload.items ?? payload.rows ?? (Array.isArray(payload) ? payload : []);
  const total = payload.pagination?.total ?? payload.total ?? rows.length;
  return { data: rows.map(normalizeReview), total };
}

function useList(params = {}, options) {
  const { page = 1, pageSize = 10, productId } = params;

  return useQuery({
    queryKey: keys.list(params),
    queryFn: async ({ signal }) => {
      const { data: body } = await httpClient.get(`/products/${productId}/reviews`, {
        params: { page, limit: pageSize },
        signal,
      });
      return normalizeList(body);
    },
    enabled: Boolean(productId),
    ...options,
  });
}

export const useReviews = { keys, useList };

import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";

/**
 * Builds a full set of TanStack Query hooks (list/detail/create/update/patch/remove)
 * for a REST-shaped resource, so every feature (products, orders, customers, ...)
 * gets the same GET/POST/PUT/PATCH/DELETE plumbing without re-implementing it.
 *
 * Example:
 *   const productHooks = createResourceHooks("products");
 *   const { data } = productHooks.useList({ page: 1, search: "ring" });
 *   const createProduct = productHooks.useCreate();
 */
export function createResourceHooks(resource) {
  const keys = {
    all: [resource],
    lists: () => [resource, "list"],
    list: (params = {}) => [resource, "list", params],
    details: () => [resource, "detail"],
    detail: (id) => [resource, "detail", id],
  };

  function useList(params = {}, options) {
    return useApiQuery(keys.list(params), `/${resource}`, { params }, options);
  }

  function useDetail(id, options) {
    return useApiQuery(keys.detail(id ?? ""), `/${resource}/${id}`, {}, { enabled: Boolean(id), ...options });
  }

  function useCreate(options = {}) {
    return useApiMutation({ method: "post", url: `/${resource}`, invalidateKeys: [keys.lists()] }, options);
  }

  function useUpdate(options = {}) {
    const queryClient = useQueryClient();
    return useApiMutation(
      {
        method: "put",
        url: (vars) => `/${resource}/${vars.id}`,
        body: (vars) => vars.data,
        invalidateKeys: [keys.lists()],
      },
      {
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
          queryClient.setQueryData(keys.detail(variables.id), data);
          options.onSuccess?.(data, variables, onMutateResult, context);
        },
      },
    );
  }

  function usePatch(options = {}) {
    const queryClient = useQueryClient();
    return useApiMutation(
      {
        method: "patch",
        url: (vars) => `/${resource}/${vars.id}`,
        body: (vars) => vars.data,
        invalidateKeys: [keys.lists()],
      },
      {
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
          queryClient.setQueryData(keys.detail(variables.id), data);
          options.onSuccess?.(data, variables, onMutateResult, context);
        },
      },
    );
  }

  function useRemove(options = {}) {
    return useApiMutation(
      { method: "delete", url: (id) => `/${resource}/${id}`, invalidateKeys: [keys.lists()] },
      options,
    );
  }

  return { keys, useList, useDetail, useCreate, useUpdate, usePatch, useRemove };
}

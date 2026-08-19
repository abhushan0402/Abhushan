import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/apiClient";

async function sendRequest(config, variables) {
  const url = typeof config.url === "function" ? config.url(variables) : config.url;
  const body = config.body ? config.body(variables) : variables;

  switch (config.method) {
    case "post":
      return (await apiClient.post(url, body)).data;
    case "put":
      return (await apiClient.put(url, body)).data;
    case "patch":
      return (await apiClient.patch(url, body)).data;
    case "delete":
      return (await apiClient.delete(url)).data;
    default:
      throw new Error(`Unsupported method: ${config.method}`);
  }
}

/**
 * Generic write hook covering POST / PUT / PATCH / DELETE. Prefer the typed
 * wrappers from `createResourceHooks` for standard CRUD resources; use this
 * directly for custom actions (e.g. "mark all notifications read").
 *
 * config: { method, url: string | (vars) => string, invalidateKeys?: unknown[][], body?: (vars) => unknown }
 */
export function useApiMutation(config, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => sendRequest(config, variables),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      config.invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

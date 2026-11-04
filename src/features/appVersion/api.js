import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

/**
 * Live on the real API (see swagger: GET /api/app/version, POST /api/app/version/update).
 * The GET endpoint only ever checks the Android build - there's no equivalent for
 * iOS yet, so `useCurrent` is only meaningful for platform "android"; iOS starts
 * from a blank form since there's nothing to prefill it with.
 */
const keys = { current: (platform) => ["appVersion", platform] };

function useCurrent(platform, options = {}) {
  return useQuery({
    queryKey: keys.current(platform),
    queryFn: async ({ signal }) => {
      // currentVersion is required by the endpoint but irrelevant here - any
      // valid semver gets back the same latestVersion/minimumSupportedVersion
      // config, which is all this form needs to prefill itself.
      const { data: body } = await httpClient.get("/app/version", {
        params: { currentVersion: "0.0.0" },
        signal,
      });
      return body?.data;
    },
    enabled: platform === "android",
    ...options,
  });
}

function useUpdate(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data: body } = await httpClient.post("/app/version/update", payload);
      return { ...body?.data, message: body?.message };
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: keys.current(variables.platform) });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export const useAppVersion = { keys, useCurrent, useUpdate };

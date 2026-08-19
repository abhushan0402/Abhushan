import { createResourceHooks } from "../../hooks/api/createResourceHooks";
import { useApiMutation } from "../../hooks/api/useApiMutation";

export const useNotifications = createResourceHooks("notifications");

export function useMarkAllNotificationsRead() {
  return useApiMutation({
    method: "post",
    url: "/notifications/mark-all-read",
    invalidateKeys: [useNotifications.keys.lists()],
  });
}

export function useMarkNotificationRead() {
  return useNotifications.usePatch();
}

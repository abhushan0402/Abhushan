import { Chip } from "@mui/material";

const STATUS_STYLES = {
  // order status
  pending: { color: "warning", label: "Pending" },
  processing: { color: "info", label: "Processing" },
  shipped: { color: "info", label: "Shipped" },
  delivered: { color: "success", label: "Delivered" },
  cancelled: { color: "error", label: "Cancelled" },
  refunded: { color: "default", label: "Refunded" },
  // payment status
  paid: { color: "success", label: "Paid" },
  unpaid: { color: "error", label: "Unpaid" },
  partially_paid: { color: "warning", label: "Partially Paid" },
  // product / category / offer / user status
  active: { color: "success", label: "Active" },
  draft: { color: "default", label: "Draft" },
  archived: { color: "default", label: "Archived" },
  inactive: { color: "default", label: "Inactive" },
  scheduled: { color: "info", label: "Scheduled" },
  expired: { color: "default", label: "Expired" },
  disabled: { color: "error", label: "Disabled" },
  blocked: { color: "error", label: "Blocked" },
  invited: { color: "info", label: "Invited" },
  suspended: { color: "error", label: "Suspended" },
};

export function StatusChip({ status, size = "small" }) {
  const meta = STATUS_STYLES[status] ?? { color: "default", label: status };
  return <Chip size={size} color={meta.color} label={meta.label} variant={meta.color === "default" ? "outlined" : "filled"} />;
}

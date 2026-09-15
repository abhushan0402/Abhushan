import { Box, Card, LinearProgress, Skeleton, Stack, Typography } from "@mui/material";

// Matches the real order status enum/colors used by StatusChip across the app.
const STATUS_META = {
  Placed: { label: "Placed", color: "info.main" },
  Confirmed: { label: "Confirmed", color: "info.main" },
  Packed: { label: "Packed", color: "info.main" },
  Shipped: { label: "Shipped", color: "accentGold.main" },
  "Out for Delivery": { label: "Out for Delivery", color: "warning.main" },
  Delivered: { label: "Delivered", color: "success.main" },
  Cancelled: { label: "Cancelled", color: "error.main" },
};

export function OrderStatusCard({ data, loading }) {
  const total = data?.reduce((sum, d) => sum + d.count, 0) ?? 0;

  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Order status
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Last 30 days
      </Typography>

      {loading ? (
        <Stack spacing={2}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={28} />
          ))}
        </Stack>
      ) : (
        <Stack spacing={2}>
          {data?.map((item) => {
            const meta = STATUS_META[item.status] ?? { label: item.status, color: "text.secondary" };
            const pct = total ? Math.round((item.count / total) * 100) : 0;
            return (
              <Box key={item.status}>
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: meta.color }} />
                    <Typography variant="body2">{meta.label}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {item.count}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 6,
                    borderRadius: 999,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": { bgcolor: meta.color, borderRadius: 999 },
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      )}
    </Card>
  );
}

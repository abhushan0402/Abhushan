import { Box, Card, Skeleton, Stack, Typography } from "@mui/material";

export function StatCard({ label, value, caption, icon: Icon, loading, accent = "primary.main" }) {
  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, letterSpacing: "0.06em", color: "text.secondary" }}
          >
            {label.toUpperCase()}
          </Typography>
          {loading ? (
            <Skeleton width={100} height={40} />
          ) : (
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {value}
            </Typography>
          )}
          {caption && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              {caption}
            </Typography>
          )}
        </Box>
        {Icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: "primary.50",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: accent,
            }}
          >
            <Icon fontSize="small" />
          </Box>
        )}
      </Stack>
    </Card>
  );
}

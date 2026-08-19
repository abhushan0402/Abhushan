import { Box, Stack, Typography } from "@mui/material";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";

export function EmptyState({ title = "Nothing here yet", description, icon: Icon = InventoryOutlinedIcon, action }) {
  return (
    <Stack sx={{ alignItems: "center", justifyContent: "center", py: 8, textAlign: "center" }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: "primary.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Icon sx={{ color: "primary.main" }} />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mt: 0.5 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Stack>
  );
}

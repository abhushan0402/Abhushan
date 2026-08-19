import { Link as RouterLink } from "react-router";
import { Box, Button, Stack, Typography } from "@mui/material";

export function StatusPage({ code, title, description }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 3,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", maxWidth: 420 }}>
        <Typography variant="h1" sx={{ fontWeight: 800, fontSize: 96, color: "primary.main", lineHeight: 1 }}>
          {code}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 1 }}>
          Back to dashboard
        </Button>
      </Stack>
    </Box>
  );
}

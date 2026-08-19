import { useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout() {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {isMobile ? (
        <Sidebar variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} />
      ) : (
        <Sidebar variant="permanent" />
      )}

      {/*
        No manual margin-left here: the permanent Sidebar's Drawer root is a
        flex item that already reserves SIDEBAR_WIDTH in this row, so `main`
        naturally starts right after it. Adding `ml` on top of that used to
        double the gap between the sidebar and the content.
      */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          pl: { xs: 2, md: 1.5 },
          pr: { xs: 2, md: 2.5 },
          pb: 4,
        }}
      >
        <Header onMenuClick={() => setMobileOpen(true)} />
        <Outlet />
      </Box>
    </Box>
  );
}

import { Avatar, Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { NavLink, useLocation } from "react-router";
import { navSections, SIDEBAR_WIDTH } from "./navConfig";
import { useAuth } from "../../auth/useAuth";
import { getInitials } from "../../utils/format";
import logo from "../../assets/logo.png";

const ROLE_LABELS = {
  superadmin: "Superadmin",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
};

function SidebarContent() {
  const location = useLocation();
  const { user, hasPermission, logout } = useAuth();

  return (
    <Stack sx={{ height: "100%" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 2.5, py: 2.5 }}>
        <Box component="img" src={logo} alt="Abhushan Vatika" sx={{ width: 40, height: 40, objectFit: "contain" }} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Abhushan Vatika
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admin Console
          </Typography>
        </Box>
      </Stack>
      <Divider />

      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1.5 }}>
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => hasPermission(item.permission));
          if (!visibleItems.length) return null;
          return (
            <Box key={section.title} sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  px: 1.5,
                  mb: 0.5,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "text.secondary",
                }}
              >
                {section.title.toUpperCase()}
              </Typography>
              <List dense disablePadding>
                {visibleItems.map((item) => {
                  const active =
                    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
                  const Icon = item.icon;
                  return (
                    <ListItemButton
                      key={item.path}
                      component={NavLink}
                      to={item.path}
                      selected={active}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        color: active ? "primary.dark" : "text.primary",
                        bgcolor: active ? "primary.50" : "transparent",
                        "&.Mui-selected": {
                          bgcolor: "primary.50",
                        },
                        "&.Mui-selected:hover": {
                          bgcolor: "primary.50",
                        },
                        "&:hover": {
                          bgcolor: active ? "primary.50" : "action.hover",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: active ? "primary.main" : "text.secondary" }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        slotProps={{ primary: { sx: { fontWeight: active ? 700 : 500, fontSize: "0.875rem" } } }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      <Divider />
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between", px: 2, py: 2 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontSize: "0.8rem" }}>
            {user ? getInitials(user.name) : "?"}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user ? ROLE_LABELS[user.role] : ""}
            </Typography>
          </Box>
        </Stack>
        <ListItemIcon
          sx={{ minWidth: "auto", color: "text.secondary", cursor: "pointer" }}
          onClick={logout}
          aria-label="Sign out"
        >
          <LogoutOutlinedIcon fontSize="small" />
        </ListItemIcon>
      </Stack>
    </Stack>
  );
}

export function Sidebar({ variant, open, onClose }) {
  if (variant === "permanent") {
    return (
      <Drawer
        variant="permanent"
        open
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            // Paper is position:fixed and sized independently of the flex slot
            // above, so its width must be SIDEBAR_WIDTH minus its own left
            // margin - otherwise it overflows past the reserved slot and
            // overlaps the main content that starts right after it.
            width: SIDEBAR_WIDTH - 16,
            boxSizing: "border-box",
            border: "none",
            mt: 2,
            mb: 2,
            ml: 2,
            mr: 0,
            height: "calc(100% - 32px)",
            borderRadius: 1.5,
            boxShadow: "0 1px 3px rgba(36,31,30,0.06)",
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, boxSizing: "border-box" },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
}

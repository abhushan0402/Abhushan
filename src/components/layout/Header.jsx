import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useAuth } from "../../auth/useAuth";
import { getInitials, formatRelativeTime } from "../../utils/format";
import { useNotifications } from "../../features/notifications/api";

export function Header({ onMenuClick }) {
  const isMobile = useMediaQuery("(max-width:900px)");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const { data } = useNotifications.useList({ pageSize: 5, sortBy: "createdAt", sortDir: "desc" });
  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", px: { xs: 2, md: 0 }, pt: 2, pb: 1.5 }}>
      {isMobile && (
        <IconButton onClick={onMenuClick} sx={{ bgcolor: "background.paper" }}>
          <MenuOutlinedIcon />
        </IconButton>
      )}

      <Box sx={{ flex: 1 }} />

      <IconButton
        sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}
        onClick={(e) => setNotifAnchor(e.currentTarget)}
      >
        <Badge color="error" badgeContent={unreadCount} max={9}>
          <NotificationsNoneOutlinedIcon fontSize="small" />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 340, maxHeight: 420 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        {notifications.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="No notifications yet" />
          </MenuItem>
        )}
        {notifications.map((n) => (
          <MenuItem
            key={n.id}
            onClick={() => {
              setNotifAnchor(null);
              navigate("/notifications");
            }}
            sx={{ whiteSpace: "normal", alignItems: "flex-start", py: 1.25 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: n.read ? 500 : 700 }}>
                {n.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {n.message}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {formatRelativeTime(n.createdAt)}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setNotifAnchor(null);
            navigate("/notifications");
          }}
          sx={{ justifyContent: "center", fontWeight: 600, color: "primary.main" }}
        >
          View all notifications
        </MenuItem>
      </Menu>

      <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ p: 0.25 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.85rem" }}>
          {user ? getInitials(user.name) : "?"}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => setUserMenuAnchor(null)}>
          <ListItemIcon>
            <PersonOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
}

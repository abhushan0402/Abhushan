import {
  Box,
  Button,
  Card,
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import { EmptyState } from "../../components/common/EmptyState";
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "./api";
import { formatRelativeTime } from "../../utils/format";

const TYPE_ICONS = {
  order: ShoppingBagOutlinedIcon,
  inventory: Inventory2OutlinedIcon,
  customer: PersonOutlineOutlinedIcon,
  system: SettingsSuggestOutlinedIcon,
  payment: PaymentsOutlinedIcon,
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications.useList({ pageSize: 50, sortBy: "createdAt", sortDir: "desc" });
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", p: { xs: 1.5, md: 2 }, pb: 0 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DoneAllOutlinedIcon />}
          disabled={!unreadCount}
          loading={markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          Mark all as read
        </Button>
      </Stack>

      <Box sx={{ mt: 2.5 }}>
        {isLoading ? (
          <Stack sx={{ alignItems: "center", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications" description="You'll see order, inventory and account updates here." />
        ) : (
          <List disablePadding>
            {notifications.map((n) => {
              const Icon = TYPE_ICONS[n.type] ?? SettingsSuggestOutlinedIcon;
              return (
                <ListItemButton
                  key={n.id}
                  onClick={() => !n.read && markRead.mutate({ id: n.id, data: { read: true } })}
                  sx={{
                    px: 2.5,
                    py: 1.75,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: n.read ? "transparent" : "primary.50",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "background.default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "primary.main",
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: n.read ? 500 : 700 }}>
                        {n.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" component="span" sx={{ display: "block" }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatRelativeTime(n.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Card>
  );
}

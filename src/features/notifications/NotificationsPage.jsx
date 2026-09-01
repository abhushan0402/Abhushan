import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSnackbar } from "notistack";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { EmptyState } from "../../components/common/EmptyState";
import { useNotifications } from "./api";
import { formatRelativeTime } from "../../utils/format";

// Confirmed notification type enum from the API.
const NOTIFICATION_TYPES = ["order", "promo", "system", "payment"];

const TYPE_ICONS = {
  order: ShoppingBagOutlinedIcon,
  promo: LocalOfferOutlinedIcon,
  system: SettingsSuggestOutlinedIcon,
  payment: PaymentsOutlinedIcon,
};

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or fewer"),
  body: z.string().min(1, "Message is required").max(1000, "Message must be 1000 characters or fewer"),
  type: z.enum(NOTIFICATION_TYPES, { message: "Select a type" }),
});

export default function NotificationsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useNotifications.useList({ pageSize: 50 });
  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  const markAllRead = useNotifications.useMarkAllRead({
    onError: () => enqueueSnackbar("Failed to mark all as read", { variant: "error" }),
  });
  const markRead = useNotifications.useMarkRead();
  const removeNotification = useNotifications.useRemove({
    onSuccess: () => enqueueSnackbar("Notification deleted", { variant: "success" }),
    onError: () => enqueueSnackbar("Failed to delete notification", { variant: "error" }),
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { title: "", body: "", type: "system" } });

  const createNotification = useNotifications.useCreate({
    onSuccess: () => {
      enqueueSnackbar("Notification created", { variant: "success" });
      setCreateOpen(false);
      reset();
    },
    onError: () => enqueueSnackbar("Failed to create notification", { variant: "error" }),
  });

  const openCreate = () => {
    reset({ title: "", body: "", type: "system" });
    setCreateOpen(true);
  };

  return (
    <>
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
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
              New notification
            </Button>
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
        </Stack>

        <Box sx={{ mt: 2.5 }}>
          {isLoading ? (
            <Stack sx={{ alignItems: "center", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : notifications.length === 0 ? (
            <EmptyState title="No notifications" description="You'll see order, promo, system and payment updates here." />
          ) : (
            <List disablePadding>
              {notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] ?? SettingsSuggestOutlinedIcon;
                return (
                  <ListItemButton
                    key={n.id}
                    onClick={() => !n.isRead && markRead.mutate(n.id)}
                    sx={{
                      px: 2.5,
                      py: 1.75,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      bgcolor: n.isRead ? "transparent" : "primary.50",
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
                        <Typography variant="body2" sx={{ fontWeight: n.isRead ? 500 : 700 }}>
                          {n.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" component="span" sx={{ display: "block" }}>
                            {n.body}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatRelativeTime(n.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                    <IconButton
                      size="small"
                      edge="end"
                      aria-label="Delete notification"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification.mutate(n.id);
                      }}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New notification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            This creates a test notification for your own admin account, not a broadcast to customers.
          </Typography>
          <Stack spacing={2.5} component="form" id="notification-form" onSubmit={handleSubmit((values) => createNotification.mutate(values))}>
            <TextField label="Title" fullWidth error={Boolean(errors.title)} helperText={errors.title?.message} {...register("title")} />
            <TextField
              label="Message"
              fullWidth
              multiline
              minRows={3}
              error={Boolean(errors.body)}
              helperText={errors.body?.message}
              {...register("body")}
            />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Type" fullWidth error={Boolean(errors.type)} helperText={errors.type?.message}>
                  {NOTIFICATION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="notification-form" variant="contained" loading={createNotification.isPending}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

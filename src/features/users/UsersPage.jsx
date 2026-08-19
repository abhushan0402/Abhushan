import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSnackbar } from "notistack";
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { DataGridCard } from "../../components/common/DataGridCard";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { StatusChip } from "../../components/common/StatusChip";
import { useServerTable } from "../../hooks/useServerTable";
import { useManagedUsers } from "./api";
import { useAuth } from "../../auth/useAuth";
import { getInitials, formatDateTime } from "../../utils/format";

const ROLE_LABELS = { superadmin: "Superadmin", admin: "Admin", manager: "Manager", staff: "Staff" };

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["superadmin", "admin", "manager", "staff"]),
});

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const table = useServerTable(useManagedUsers, { sortBy: "createdAt", sortDir: "desc" });
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", role: "staff" } });

  const createUser = useManagedUsers.useCreate({
    onSuccess: () => {
      enqueueSnackbar("Invitation sent", { variant: "success" });
      setEditing(null);
    },
  });
  const updateUser = useManagedUsers.useUpdate({
    onSuccess: () => {
      enqueueSnackbar("User updated", { variant: "success" });
      setEditing(null);
    },
  });
  const removeUser = useManagedUsers.useRemove({
    onSuccess: () => {
      enqueueSnackbar("User removed", { variant: "success" });
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    reset({ name: "", email: "", role: "staff" });
    setEditing({});
  };
  const openEdit = (row) => {
    reset({ name: row.name, email: row.email, role: row.role });
    setEditing(row);
  };

  const onSubmit = (values) => {
    if (editing?.id) {
      updateUser.mutate({ id: editing.id, data: values });
    } else {
      createUser.mutate({ ...values, status: "invited", createdAt: new Date().toISOString() });
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Team member",
      flex: 1.2,
      minWidth: 220,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", height: "100%" }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "secondary.main" }}>{getInitials(params.row.name)}</Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{params.row.email}</Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 0.7,
      minWidth: 130,
      renderCell: (params) => <Chip size="small" label={ROLE_LABELS[params.row.role]} variant="outlined" />,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.6,
      minWidth: 110,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
    {
      field: "lastActiveAt",
      headerName: "Last active",
      flex: 0.8,
      minWidth: 150,
      valueFormatter: (value) => (value ? formatDateTime(value) : "-"),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 120,
      getActions: (params) =>
        params.row.id === currentUser?.id
          ? []
          : [
              <GridActionsCellItem key="edit" icon={<EditOutlinedIcon fontSize="small" />} label="Edit" onClick={() => openEdit(params.row)} />,
              <GridActionsCellItem
                key="delete"
                icon={<DeleteOutlineOutlinedIcon fontSize="small" />}
                label="Remove"
                onClick={() => setDeleteTarget(params.row)}
              />,
            ],
    },
  ];

  return (
    <>
      <DataGridCard
        title="Users & Roles"
        subtitle="Manage admin console access for your team"
        action={
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
            Invite user
          </Button>
        }
        rows={table.rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowCount={table.rowCount}
        loading={table.isLoading || table.isFetching}
        page={table.page}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        sortModel={table.sortModel}
        onSortModelChange={table.setSortModel}
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search by name or email..."
      />

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing?.id ? "Edit user" : "Invite user"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }} component="form" id="user-form" onSubmit={handleSubmit(onSubmit)}>
            <TextField label="Full name" fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} {...register("name")} />
            <TextField label="Email address" fullWidth error={Boolean(errors.email)} helperText={errors.email?.message} {...register("email")} />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Role" fullWidth>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="superadmin">Superadmin</MenuItem>
                </TextField>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" variant="contained" loading={createUser.isPending || updateUser.isPending}>
            {editing?.id ? "Save changes" : "Send invite"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove user?"
        description={
          <>
            <Typography component="span" sx={{ fontWeight: 700 }}>{deleteTarget?.name}</Typography> will lose access to the admin console.
          </>
        }
        confirmLabel="Remove"
        loading={removeUser.isPending}
        onConfirm={() => removeUser.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSnackbar } from "notistack";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
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
import { useOffers } from "./api";
import { useAuth } from "../../auth/useAuth";
import { formatDate } from "../../utils/format";

const schema = z.object({
  code: z.string().min(2, "Offer code is required"),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["percentage", "flat"]),
  value: z.coerce.number().min(0, "Value can't be negative"),
  startsAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().min(1, "End date is required"),
  status: z.enum(["active", "scheduled", "expired", "disabled"]),
});

function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export default function OffersPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("offers:manage");
  const { enqueueSnackbar } = useSnackbar();

  const table = useServerTable(useOffers, { sortBy: "startsAt", sortDir: "desc" });
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { code: "", title: "", description: "", type: "percentage", value: "", startsAt: "", endsAt: "", status: "active" },
  });

  const createOffer = useOffers.useCreate({
    onSuccess: () => {
      enqueueSnackbar("Offer created", { variant: "success" });
      setEditing(null);
    },
  });
  const updateOffer = useOffers.useUpdate({
    onSuccess: () => {
      enqueueSnackbar("Offer updated", { variant: "success" });
      setEditing(null);
    },
  });
  const removeOffer = useOffers.useRemove({
    onSuccess: () => {
      enqueueSnackbar("Offer deleted", { variant: "success" });
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    reset({ code: "", title: "", description: "", type: "percentage", value: "", startsAt: "", endsAt: "", status: "active" });
    setEditing({});
  };
  const openEdit = (row) => {
    reset({
      code: row.code,
      title: row.title,
      description: row.description ?? "",
      type: row.type,
      value: row.value,
      startsAt: toDateInput(row.startsAt),
      endsAt: toDateInput(row.endsAt),
      status: row.status,
    });
    setEditing(row);
  };

  const onSubmit = (values) => {
    const payload = {
      ...values,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
    };
    if (editing?.id) {
      updateOffer.mutate({ id: editing.id, data: payload });
    } else {
      createOffer.mutate({ ...payload, usedCount: 0 });
    }
  };

  const columns = [
    {
      field: "code",
      headerName: "Code",
      flex: 0.7,
      minWidth: 110,
      renderCell: (params) => <Chip size="small" label={params.row.code} sx={{ fontWeight: 700 }} />,
    },
    { field: "title", headerName: "Title", flex: 1.2, minWidth: 170 },
    {
      field: "value",
      headerName: "Discount",
      flex: 0.6,
      minWidth: 90,
      renderCell: (params) => (params.row.type === "percentage" ? `${params.row.value}%` : `₹${params.row.value}`),
    },
    { field: "usedCount", headerName: "Redeemed", flex: 0.6, minWidth: 80 },
    {
      field: "endsAt",
      headerName: "Ends on",
      flex: 0.7,
      minWidth: 110,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
    ...(canManage
      ? [
          {
            field: "actions",
            type: "actions",
            headerName: "",
            width: 120,
            getActions: (params) => [
              <GridActionsCellItem key="edit" icon={<EditOutlinedIcon fontSize="small" />} label="Edit" onClick={() => openEdit(params.row)} />,
              <GridActionsCellItem
                key="delete"
                icon={<DeleteOutlineOutlinedIcon fontSize="small" />}
                label="Delete"
                onClick={() => setDeleteTarget(params.row)}
              />,
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      <DataGridCard
        title="Offers"
        subtitle="Discounts and promotional codes"
        action={
          canManage && (
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
              Add offer
            </Button>
          )
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
        searchPlaceholder="Search by code or title..."
      />

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing?.id ? "Edit offer" : "Add offer"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.25 }} component="form" id="offer-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Offer code" fullWidth error={Boolean(errors.code)} helperText={errors.code?.message} {...register("code")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Title" fullWidth error={Boolean(errors.title)} helperText={errors.title?.message} {...register("title")} />
            </Grid>
            <Grid size={12}>
              <TextField label="Description" fullWidth multiline minRows={2} {...register("description")} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Type" fullWidth>
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="flat">Flat</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField label="Value" type="number" fullWidth error={Boolean(errors.value)} helperText={errors.value?.message} {...register("value")} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField label="Starts on" type="date" fullWidth InputLabelProps={{ shrink: true }} error={Boolean(errors.startsAt)} {...register("startsAt")} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField label="Ends on" type="date" fullWidth InputLabelProps={{ shrink: true }} error={Boolean(errors.endsAt)} {...register("endsAt")} />
            </Grid>
            <Grid size={12}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button type="submit" form="offer-form" variant="contained" loading={createOffer.isPending || updateOffer.isPending}>
            {editing?.id ? "Save changes" : "Create offer"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete offer?"
        description={
          <>
            This will permanently remove <Typography component="span" sx={{ fontWeight: 700 }}>{deleteTarget?.code}</Typography>.
          </>
        }
        confirmLabel="Delete"
        loading={removeOffer.isPending}
        onConfirm={() => removeOffer.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

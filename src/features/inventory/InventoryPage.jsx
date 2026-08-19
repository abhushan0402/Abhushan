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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { DataGridCard } from "../../components/common/DataGridCard";
import { useServerTable } from "../../hooks/useServerTable";
import { useInventoryMovements } from "./api";
import { useProducts } from "../products/api";
import { useAuth } from "../../auth/useAuth";
import { formatDateTime } from "../../utils/format";

const TYPE_COLORS = { restock: "success", sale: "error", adjustment: "warning", return: "info" };

const schema = z.object({
  productId: z.string().min(1, "Select a product"),
  type: z.enum(["restock", "sale", "adjustment", "return"]),
  quantity: z.coerce.number().refine((v) => v !== 0, "Quantity can't be zero"),
  note: z.string().optional(),
});

export default function InventoryPage() {
  const { hasPermission, user } = useAuth();
  const canManage = hasPermission("inventory:manage");
  const { enqueueSnackbar } = useSnackbar();
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const table = useServerTable(useInventoryMovements, {
    sortBy: "createdAt",
    sortDir: "desc",
    extraParams: { type: typeFilter === "all" ? undefined : typeFilter },
  });

  const { data: productsData } = useProducts.useList({ pageSize: 200 });
  const products = productsData?.data ?? [];

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { productId: "", type: "restock", quantity: "", note: "" } });

  const createMovement = useInventoryMovements.useCreate({
    onSuccess: () => {
      enqueueSnackbar("Inventory movement recorded", { variant: "success" });
      setDialogOpen(false);
      reset();
    },
  });

  const onSubmit = (values) => {
    const product = products.find((p) => p.id === values.productId);
    const quantity = values.type === "sale" ? -Math.abs(values.quantity) : Math.abs(values.quantity);
    createMovement.mutate({
      ...values,
      quantity,
      productName: product?.name ?? "",
      sku: product?.sku ?? "",
      stockAfter: Math.max(0, (product?.stock ?? 0) + quantity),
      createdBy: user?.name ?? "Unknown",
    });
  };

  const columns = [
    { field: "productName", headerName: "Product", flex: 1.2, minWidth: 170 },
    { field: "sku", headerName: "SKU", flex: 0.8, minWidth: 110 },
    {
      field: "type",
      headerName: "Type",
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => <Chip size="small" label={params.row.type} color={TYPE_COLORS[params.row.type]} />,
    },
    {
      field: "quantity",
      headerName: "Qty",
      flex: 0.5,
      minWidth: 70,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: params.row.quantity < 0 ? "error.main" : "success.main" }}>
          {params.row.quantity > 0 ? `+${params.row.quantity}` : params.row.quantity}
        </Typography>
      ),
    },
    { field: "stockAfter", headerName: "Stock after", flex: 0.6, minWidth: 90 },
    { field: "createdBy", headerName: "By", flex: 0.8, minWidth: 110 },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 0.9,
      minWidth: 130,
      valueFormatter: (value) => formatDateTime(value),
    },
  ];

  return (
    <>
      <DataGridCard
        title="Inventory"
        subtitle="Track stock movements across your catalogue"
        action={
          canManage && (
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setDialogOpen(true)}>
              Record movement
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
        searchPlaceholder="Search by product or SKU..."
        toolbarExtra={
          <TextField select size="small" label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="all">All types</MenuItem>
            <MenuItem value="restock">Restock</MenuItem>
            <MenuItem value="sale">Sale</MenuItem>
            <MenuItem value="adjustment">Adjustment</MenuItem>
            <MenuItem value="return">Return</MenuItem>
          </TextField>
        }
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record stock movement</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }} component="form" id="movement-form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="productId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Product" fullWidth error={Boolean(errors.productId)} helperText={errors.productId?.message}>
                  {products.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Movement type" fullWidth>
                  <MenuItem value="restock">Restock</MenuItem>
                  <MenuItem value="sale">Sale</MenuItem>
                  <MenuItem value="adjustment">Adjustment</MenuItem>
                  <MenuItem value="return">Return</MenuItem>
                </TextField>
              )}
            />
            <TextField label="Quantity" type="number" fullWidth error={Boolean(errors.quantity)} helperText={errors.quantity?.message} {...register("quantity")} />
            <TextField label="Note (optional)" fullWidth multiline minRows={2} {...register("note")} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="movement-form" variant="contained" loading={createMovement.isPending}>
            Save movement
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

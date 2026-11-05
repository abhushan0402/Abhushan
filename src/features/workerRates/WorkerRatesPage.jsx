import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSnackbar } from "notistack";
import {
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { PageHeader } from "../../components/common/PageHeader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { useWorkerRates, useWorkerRateProducts, PRODUCT_CATEGORIES } from "./api";
import { useAuth } from "../../auth/useAuth";
import { formatCurrency, formatDateTime } from "../../utils/format";

const CATEGORY_LABELS = { GOLD: "Gold", SILVER: "Silver" };

const productSchema = z.object({
  productName: z.string().trim().min(1, "Product name cannot be empty"),
  category: z.enum(PRODUCT_CATEGORIES, { message: "Select a category" }),
  workerRate: z.coerce.number({ message: "Worker rate is required" }).min(0, "Worker rate can't be negative"),
  // Empty field -> undefined (omitted from the payload) rather than being
  // coerced to 0 - z.coerce.number() on "" would otherwise silently succeed.
  makingCharge: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce
      .number()
      .min(0, "Making charge can't be negative")
      .max(100, "Making charge can't exceed 100%")
      .optional(),
  ),
});

const gstSchema = z.object({
  gstPercentage: z.coerce.number().min(0, "Can't be negative").max(100, "Can't exceed 100"),
});

const emptyProductDefaults = { productName: "", category: "GOLD", workerRate: "", makingCharge: "" };

function ProductRow({ product, canManage, onEdit, onDelete }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", py: 1.5 }}>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {product.productName}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 0.25, flexWrap: "wrap" }}>
          <Typography variant="caption" color="text.secondary">
            Worker rate: {formatCurrency(product.workerRate)}
          </Typography>
          {product.makingCharge != null && (
            <Typography variant="caption" color="text.secondary">
              Making charge: {product.makingCharge}%
            </Typography>
          )}
        </Stack>
      </Stack>
      {canManage && (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => onEdit(product)} aria-label={`Edit ${product.productName}`}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(product)} aria-label={`Delete ${product.productName}`}>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
}

function CategorySection({ title, products, isLoading, canManage, onEdit, onDelete }) {
  return (
    <Card sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      {isLoading ? (
        <Stack sx={{ alignItems: "center", py: 4 }}>
          <CircularProgress size={24} />
        </Stack>
      ) : products.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No {title.toLowerCase()} products added yet.
        </Typography>
      ) : (
        products.map((product, index) => (
          <Stack key={product.id}>
            {index > 0 && <Divider />}
            <ProductRow product={product} canManage={canManage} onEdit={onEdit} onDelete={onDelete} />
          </Stack>
        ))
      )}
    </Card>
  );
}

export default function WorkerRatesPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("workerRates:manage");
  const { enqueueSnackbar } = useSnackbar();

  const { data: products = [], isLoading: productsLoading } = useWorkerRateProducts.useList();
  const goldProducts = useMemo(() => products.filter((p) => p.category === "GOLD"), [products]);
  const silverProducts = useMemo(() => products.filter((p) => p.category === "SILVER"), [products]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(productSchema), defaultValues: emptyProductDefaults });

  const openAddDialog = () => {
    setEditingProduct(null);
    reset(emptyProductDefaults);
    setDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    reset({
      productName: product.productName,
      category: product.category,
      workerRate: product.workerRate,
      makingCharge: product.makingCharge ?? "",
    });
    setDialogOpen(true);
  };

  const createProduct = useWorkerRateProducts.useCreate({
    onSuccess: (data) => {
      enqueueSnackbar(data?.message ?? "Product added", { variant: "success" });
      setDialogOpen(false);
    },
    onError: (error) => enqueueSnackbar(error?.response?.data?.message ?? "Failed to add product", { variant: "error" }),
  });

  const updateProduct = useWorkerRateProducts.useUpdate({
    onSuccess: (data) => {
      enqueueSnackbar(data?.message ?? "Product updated", { variant: "success" });
      setDialogOpen(false);
    },
    onError: (error) => enqueueSnackbar(error?.response?.data?.message ?? "Failed to update product", { variant: "error" }),
  });

  const removeProduct = useWorkerRateProducts.useRemove({
    onSuccess: (data) => {
      enqueueSnackbar(data?.message ?? "Product deleted", { variant: "success" });
      setDeleteTarget(null);
    },
    onError: (error) => enqueueSnackbar(error?.response?.data?.message ?? "Failed to delete product", { variant: "error" }),
  });

  const onSubmitProduct = (values) => {
    const duplicate = products.find(
      (p) =>
        p.category === values.category &&
        p.productName.trim().toLowerCase() === values.productName.trim().toLowerCase() &&
        p.id !== editingProduct?.id,
    );
    if (duplicate) {
      setError("productName", { message: "A product with this name already exists in this category" });
      return;
    }

    const payload = {
      productName: values.productName.trim(),
      category: values.category,
      workerRate: values.workerRate,
      ...(values.makingCharge != null ? { makingCharge: values.makingCharge } : {}),
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  // --- GST (unchanged, separate settings-style endpoint) ---
  const { data: gst, isLoading: gstLoading } = useWorkerRates.useDetail();
  const {
    register: registerGst,
    handleSubmit: handleGstSubmit,
    reset: resetGst,
    formState: { errors: gstErrors },
  } = useForm({ resolver: zodResolver(gstSchema), defaultValues: { gstPercentage: "" } });

  useEffect(() => {
    if (gst) resetGst({ gstPercentage: gst.gstPercentage });
  }, [gst, resetGst]);

  const updateGst = useWorkerRates.useUpdate({
    onSuccess: (data) => enqueueSnackbar(data?.message ?? "GST updated", { variant: "success" }),
    onError: (error) => enqueueSnackbar(error?.response?.data?.message ?? "Failed to update GST", { variant: "error" }),
  });

  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <>
      <PageHeader
        title="Worker rates"
        subtitle="Making-charge rates for gold & silver products"
        action={
          canManage && (
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openAddDialog}>
              Add new product
            </Button>
          )
        }
      />

      <CategorySection
        title="Gold"
        products={goldProducts}
        isLoading={productsLoading}
        canManage={canManage}
        onEdit={openEditDialog}
        onDelete={setDeleteTarget}
      />
      <CategorySection
        title="Silver"
        products={silverProducts}
        isLoading={productsLoading}
        canManage={canManage}
        onEdit={openEditDialog}
        onDelete={setDeleteTarget}
      />

      <Card sx={{ p: { xs: 2, md: 3 }, maxWidth: 420 }} component="form" onSubmit={handleGstSubmit((v) => updateGst.mutate(v))}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Tax
        </Typography>
        {gstLoading ? (
          <Stack sx={{ alignItems: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <>
            <TextField
              label="GST"
              type="number"
              fullWidth
              disabled={!canManage}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }, htmlInput: { step: "any" } }}
              error={Boolean(gstErrors.gstPercentage)}
              helperText={gstErrors.gstPercentage?.message ?? (gst?.updatedAt ? `Last updated ${formatDateTime(gst.updatedAt)}` : undefined)}
              {...registerGst("gstPercentage")}
            />
            {canManage && (
              <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 2 }}>
                <Button type="submit" variant="contained" loading={updateGst.isPending}>
                  Save GST
                </Button>
              </Stack>
            )}
          </>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingProduct ? "Edit product" : "Add new product"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }} component="form" id="worker-rate-product-form" onSubmit={handleSubmit(onSubmitProduct)}>
            <TextField
              label="Product name"
              fullWidth
              autoFocus
              error={Boolean(errors.productName)}
              helperText={errors.productName?.message}
              {...register("productName")}
            />
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Category" fullWidth error={Boolean(errors.category)} helperText={errors.category?.message}>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              label="Worker rate"
              type="number"
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }, htmlInput: { step: "any" } }}
              error={Boolean(errors.workerRate)}
              helperText={errors.workerRate?.message}
              {...register("workerRate")}
            />
            <TextField
              label="Making charge % (optional)"
              type="number"
              fullWidth
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }, htmlInput: { step: "any", min: 0, max: 100 } }}
              error={Boolean(errors.makingCharge)}
              helperText={errors.makingCharge?.message ?? "Applied on the gold amount before GST"}
              {...register("makingCharge")}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" disabled={saving} onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="worker-rate-product-form" variant="contained" loading={saving}>
            {editingProduct ? "Update product" : "Save product"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete worker rate product?"
        description="Are you sure you want to delete this worker rate product?"
        confirmLabel="Delete"
        loading={removeProduct.isPending}
        onConfirm={() => removeProduct.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

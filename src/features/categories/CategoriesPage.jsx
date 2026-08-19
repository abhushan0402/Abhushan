import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
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
  FormControlLabel,
  Stack,
  Switch,
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
import { ImagePickerField } from "../../components/common/ImagePickerField";
import { useServerTable } from "../../hooks/useServerTable";
import { useCategories } from "./api";
import { useAuth } from "../../auth/useAuth";

const schema = z.object({
  name: z.string().min(2, "Category name is required"),
  metalType: z.string().min(1, "Metal type is required"),
  image: z.any().optional(),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean(),
});

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("categories:manage");
  const { enqueueSnackbar } = useSnackbar();

  const table = useServerTable(useCategories, { sortBy: "name", sortDir: "asc", pageSize: 10 });
  const [editing, setEditing] = useState(null); // null = closed, {} = create, {...row} = edit
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", metalType: "gold", description: "", displayOrder: 0, isActive: true },
  });
  const selectedImageFile = watch("image")?.[0];

  const createCategory = useCategories.useCreate({
    onSuccess: () => {
      enqueueSnackbar("Category created", { variant: "success" });
      setEditing(null);
    },
  });
  const updateCategory = useCategories.useUpdate({
    onSuccess: () => {
      enqueueSnackbar("Category updated", { variant: "success" });
      setEditing(null);
    },
  });
  const removeCategory = useCategories.useRemove({
    onSuccess: () => {
      enqueueSnackbar("Category deleted", { variant: "success" });
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    reset({ name: "", metalType: "gold", description: "", displayOrder: 0, isActive: true });
    setEditing({});
  };
  const openEdit = (row) => {
    reset({
      name: row.name,
      metalType: row.metalType ?? "gold",
      description: row.description ?? "",
      displayOrder: row.displayOrder ?? 0,
      isActive: row.isActive ?? true,
    });
    setEditing(row);
  };

  const onSubmit = (values) => {
    const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { image, ...rest } = values;
    const payload = { ...rest, slug };
    if (image?.[0]) payload.image = image[0];

    if (editing?.id) {
      updateCategory.mutate({ id: editing.id, data: payload });
    } else {
      createCategory.mutate(payload);
    }
  };

  const columns = [
    { field: "name", headerName: "Category", flex: 1.2, minWidth: 180 },
    {
      field: "metalType",
      headerName: "Metal type",
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => <Chip size="small" label={params.row.metalType} variant="outlined" />,
    },
    { field: "description", headerName: "Description", flex: 1.6, minWidth: 220 },
    {
      field: "isActive",
      headerName: "Status",
      flex: 0.6,
      minWidth: 110,
      renderCell: (params) => <StatusChip status={params.row.isActive === false ? "inactive" : "active"} />,
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
        title="Categories"
        subtitle="Organise your jewellery collections"
        action={
          canManage && (
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
              Add category
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
        searchPlaceholder="Search categories..."
        onRowClick={(params) => navigate(`/products?categoryId=${params.id}`)}
      />

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing?.id ? "Edit category" : "Add category"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }} component="form" id="category-form" onSubmit={handleSubmit(onSubmit)}>
            <TextField label="Name" fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} {...register("name")} />
            <TextField
              label="Metal type"
              fullWidth
              placeholder="gold, silver, 925imported..."
              error={Boolean(errors.metalType)}
              helperText={errors.metalType?.message}
              {...register("metalType")}
            />
            <ImagePickerField
              register={register}
              name="image"
              selectedFile={selectedImageFile}
              existingImageUrl={editing?.image}
            />
            <TextField label="Description" fullWidth multiline minRows={2} {...register("description")} />
            <TextField
              label="Display order"
              type="number"
              fullWidth
              error={Boolean(errors.displayOrder)}
              helperText={errors.displayOrder?.message}
              {...register("displayOrder")}
            />
            <FormControlLabel control={<Switch {...register("isActive")} defaultChecked />} label="Active" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" variant="contained" loading={createCategory.isPending || updateCategory.isPending}>
            {editing?.id ? "Save changes" : "Create category"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        description={
          <>
            This will permanently remove <Typography component="span" sx={{ fontWeight: 700 }}>{deleteTarget?.name}</Typography>.
          </>
        }
        confirmLabel="Delete"
        loading={removeCategory.isPending}
        onConfirm={() => removeCategory.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

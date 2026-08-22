import { useMemo, useState } from "react";
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
import { ImagePickerField } from "../../components/common/ImagePickerField";
import { useServerTable } from "../../hooks/useServerTable";
import { useSubCategories } from "./api";
import { useCategories } from "../categories/api";
import { useAuth } from "../../auth/useAuth";

const schema = z.object({
  name: z.string().min(2, "Subcategory name is required"),
  categoryId: z.string().min(1, "Select a category"),
  metalType: z.string().min(1, "Metal type is required"),
  gender: z.string().min(1, "Gender is required"),
  productType: z.string().min(1, "Product type is required"),
  image: z.any().optional(),
  description: z.string().optional(),
});

const emptyValues = {
  name: "",
  categoryId: "",
  metalType: "gold",
  gender: "men",
  productType: "",
  description: "",
};

export default function SubCategoriesPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("categories:manage");
  const { enqueueSnackbar } = useSnackbar();

  const { data: categoriesData } = useCategories.useList({ pageSize: 100 });
  const categories = useMemo(() => categoriesData?.data ?? [], [categoriesData]);
  const categoryNameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const table = useServerTable(useSubCategories, { pageSize: 10 });
  const [editing, setEditing] = useState(null); // null = closed, {} = create, {...row} = edit
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: emptyValues });
  const selectedImageFile = watch("image")?.[0];

  const createSubCategory = useSubCategories.useCreate({
    onSuccess: () => {
      enqueueSnackbar("Subcategory created", { variant: "success" });
      setEditing(null);
    },
  });
  const updateSubCategory = useSubCategories.useUpdate({
    onSuccess: () => {
      enqueueSnackbar("Subcategory updated", { variant: "success" });
      setEditing(null);
    },
  });
  const removeSubCategory = useSubCategories.useRemove({
    onSuccess: () => {
      enqueueSnackbar("Subcategory deleted", { variant: "success" });
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    reset(emptyValues);
    setEditing({});
  };
  const openEdit = (row) => {
    reset({
      name: row.name,
      categoryId: row.categoryId ?? "",
      metalType: row.metalType ?? "gold",
      gender: row.gender ?? "men",
      productType: row.productType ?? "",
      description: row.description ?? "",
    });
    setEditing(row);
  };

  const onSubmit = (values) => {
    const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { image, ...rest } = values;
    const payload = { ...rest, slug };
    if (image?.[0]) payload.image = image[0];

    if (editing?.id) {
      updateSubCategory.mutate({ id: editing.id, data: payload });
    } else {
      createSubCategory.mutate(payload);
    }
  };

  const columns = [
    { field: "name", headerName: "Subcategory", flex: 1.1, minWidth: 170 },
    {
      field: "categoryId",
      headerName: "Category",
      flex: 0.9,
      minWidth: 150,
      renderCell: (params) => params.row.categoryName ?? categoryNameById.get(params.row.categoryId) ?? "—",
    },
    {
      field: "metalType",
      headerName: "Metal type",
      flex: 0.5,
      minWidth: 110,
      renderCell: (params) => <Chip size="small" label={params.row.metalType} variant="outlined" />,
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => <Chip size="small" label={params.row.gender} variant="outlined" />,
    },
    { field: "productType", headerName: "Product type", flex: 0.8, minWidth: 140 },
    {
      field: "isActive",
      headerName: "Status",
      flex: 0.5,
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
        title="Subcategories"
        subtitle="Article types within each category (e.g. Ring, Chain, Bracelet)"
        action={
          canManage && (
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
              Add subcategory
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
        searchPlaceholder="Search subcategories..."
        onRowClick={(params) => navigate(`/products?categoryId=${params.row.categoryId}&subCategoryId=${params.id}`)}
      />

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing?.id ? "Edit subcategory" : "Add subcategory"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }} component="form" id="subcategory-form" onSubmit={handleSubmit(onSubmit)}>
            <TextField label="Name" fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} {...register("name")} />
            <TextField
              select
              label="Category"
              fullWidth
              defaultValue=""
              error={Boolean(errors.categoryId)}
              helperText={errors.categoryId?.message}
              {...register("categoryId")}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Metal type"
              fullWidth
              placeholder="gold, silver, 925imported..."
              error={Boolean(errors.metalType)}
              helperText={errors.metalType?.message}
              {...register("metalType")}
            />
            <TextField
              label="Gender"
              fullWidth
              placeholder="men, women, kids..."
              error={Boolean(errors.gender)}
              helperText={errors.gender?.message}
              {...register("gender")}
            />
            <TextField
              label="Product type"
              fullWidth
              placeholder="e.g. Ring, Chain, Bracelet"
              error={Boolean(errors.productType)}
              helperText={errors.productType?.message}
              {...register("productType")}
            />
            <ImagePickerField
              register={register}
              setValue={setValue}
              name="image"
              selectedFile={selectedImageFile}
              existingImageUrl={editing?.image}
            />
            <TextField label="Description" fullWidth multiline minRows={2} {...register("description")} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="subcategory-form"
            variant="contained"
            loading={createSubCategory.isPending || updateSubCategory.isPending}
          >
            {editing?.id ? "Save changes" : "Create subcategory"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete subcategory?"
        description={
          <>
            This will permanently remove <Typography component="span" sx={{ fontWeight: 700 }}>{deleteTarget?.name}</Typography>.
          </>
        }
        confirmLabel="Delete"
        loading={removeSubCategory.isPending}
        onConfirm={() => removeSubCategory.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

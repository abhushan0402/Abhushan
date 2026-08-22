import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Avatar, Button, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { DataGridCard } from "../../components/common/DataGridCard";
import { StatusChip } from "../../components/common/StatusChip";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { useServerTable } from "../../hooks/useServerTable";
import { useProducts } from "./api";
import { useCategories } from "../categories/api";
import { useSubCategories } from "../subcategories/api";
import { useAuth } from "../../auth/useAuth";
import { formatCurrency } from "../../utils/format";
import { useSnackbar } from "notistack";

// Single source of truth for the tag filter dropdown and the Tags column - each
// chip only renders when its field is actually true on the product.
const PRODUCT_TAGS = [
  { field: "isTrending", filterValue: "trending", label: "Trending", color: "warning" },
  { field: "isFeatured", filterValue: "featured", label: "Featured", color: "info" },
  { field: "isBestSeller", filterValue: "bestseller", label: "Best seller", color: "success" },
  { field: "isNewArrival", filterValue: "newarrival", label: "New arrival", color: "primary" },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("products:manage");
  const { enqueueSnackbar } = useSnackbar();

  // Categories/Subcategories pages deep-link here (?categoryId=..., ?subCategoryId=...)
  // to show just that category/subcategory's products.
  const [searchParams] = useSearchParams();

  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("categoryId") ?? "all");
  const [subCategoryFilter, setSubCategoryFilter] = useState(searchParams.get("subCategoryId") ?? "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const activeTag = PRODUCT_TAGS.find((tag) => tag.filterValue === tagFilter);

  const table = useServerTable(useProducts, {
    sortBy: "name",
    sortDir: "asc",
    extraParams: {
      categoryId: categoryFilter === "all" ? undefined : categoryFilter,
      subCategoryId: subCategoryFilter === "all" ? undefined : subCategoryFilter,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      ...(activeTag && { [activeTag.field]: true }),
    },
  });

  const { data: categoriesData } = useCategories.useList({ pageSize: 100 });
  const categories = categoriesData?.data ?? [];

  const { data: subCategoriesData } = useSubCategories.useList({ pageSize: 100 });
  const subCategories = useMemo(() => subCategoriesData?.data ?? [], [subCategoriesData]);
  const subCategoryOptions = useMemo(
    () => (categoryFilter === "all" ? subCategories : subCategories.filter((sc) => sc.categoryId === categoryFilter)),
    [subCategories, categoryFilter],
  );

  const removeProduct = useProducts.useRemove({
    onSuccess: () => {
      enqueueSnackbar("Product deleted", { variant: "success" });
      setDeleteTarget(null);
    },
    onError: () => enqueueSnackbar("Failed to delete product", { variant: "error" }),
  });

  const columns = [
    {
      field: "name",
      headerName: "Product",
      flex: 1.4,
      minWidth: 190,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", height: "100%" }}>
          <Avatar variant="rounded" sx={{ bgcolor: "primary.50", color: "primary.main", width: 34, height: 34 }}>
            <DiamondOutlinedIcon fontSize="small" />
          </Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.sku}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    { field: "categoryName", headerName: "Category", flex: 0.9, minWidth: 110 },
    { field: "metalType", headerName: "Metal type", flex: 0.7, minWidth: 100 },
    {
      field: "basePrice",
      headerName: "Price",
      flex: 0.8,
      minWidth: 100,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: "stock",
      headerName: "Stock",
      flex: 0.6,
      minWidth: 70,
      renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.row.stock}</Typography>,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => <StatusChip status={params.row.isActive === false ? "inactive" : "active"} />,
    },
    {
      field: "tags",
      headerName: "Tags",
      flex: 0.8,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", alignItems: "center", height: "100%", py: 0.5 }}>
          {PRODUCT_TAGS.filter((tag) => params.row[tag.field]).map((tag) => (
            <Chip key={tag.field} size="small" label={tag.label} color={tag.color} variant="outlined" />
          ))}
        </Stack>
      ),
    },
    ...(canManage
      ? [
          {
            field: "actions",
            type: "actions",
            headerName: "",
            width: 120,
            getActions: (params) => [
              <GridActionsCellItem
                key="edit"
                icon={<EditOutlinedIcon fontSize="small" />}
                label="Edit"
                onClick={() => navigate(`/products/${params.id}/edit`)}
              />,
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
        title="Products"
        subtitle="Manage your jewellery catalogue"
        action={
          canManage && (
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => navigate("/products/new")}>
              Add product
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
        searchPlaceholder="Search products by name, SKU, material..."
        toolbarExtra={
          <>
            <TextField
              select
              size="small"
              label="Category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSubCategoryFilter("all");
              }}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Subcategory"
              value={subCategoryFilter}
              onChange={(e) => setSubCategoryFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All subcategories</MenuItem>
              {subCategoryOptions.map((sc) => (
                <MenuItem key={sc.id} value={sc.id}>
                  {sc.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 130 }}>
              <MenuItem value="all">All status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <TextField select size="small" label="Tag" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="all">All tags</MenuItem>
              {PRODUCT_TAGS.map((tag) => (
                <MenuItem key={tag.filterValue} value={tag.filterValue}>
                  {tag.label}
                </MenuItem>
              ))}
            </TextField>
          </>
        }
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        description={`This will permanently remove "${deleteTarget?.name}" from your catalogue.`}
        confirmLabel="Delete"
        loading={removeProduct.isPending}
        onConfirm={() => removeProduct.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

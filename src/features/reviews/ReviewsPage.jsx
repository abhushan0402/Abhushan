import { useMemo, useState } from "react";
import { Autocomplete, Rating, Stack, TextField } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";
import { DataGridCard } from "../../components/common/DataGridCard";
import { EmptyState } from "../../components/common/EmptyState";
import { useServerTable } from "../../hooks/useServerTable";
import { useReviews } from "./api";
import { useProducts } from "../products/api";
import { formatDateTime } from "../../utils/format";

export default function ReviewsPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: productsData, isLoading: loadingProducts } = useProducts.useList({ pageSize: 100 });
  const products = useMemo(() => productsData?.data ?? [], [productsData]);

  const table = useServerTable(useReviews, {
    pageSize: 10,
    extraParams: { productId: selectedProduct?.id },
  });

  const columns = [
    { field: "reviewerName", headerName: "Reviewer", flex: 0.9, minWidth: 160 },
    {
      field: "rating",
      headerName: "Rating",
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => <Rating value={Number(params.row.rating) || 0} readOnly size="small" />,
    },
    { field: "comment", headerName: "Comment", flex: 2, minWidth: 240 },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 0.8,
      minWidth: 140,
      valueFormatter: (value) => (value ? formatDateTime(value) : "—"),
    },
  ];

  return (
    <>
      <PageHeader title="Reviews" subtitle="Customer reviews for a selected product" />

      <Stack sx={{ mb: 2.5 }}>
        <Autocomplete
          options={products}
          loading={loadingProducts}
          value={selectedProduct}
          onChange={(event, value) => setSelectedProduct(value)}
          getOptionLabel={(product) => `${product.name}${product.sku ? ` (${product.sku})` : ""}`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => <TextField {...params} label="Select a product" placeholder="Search by name or SKU..." />}
          sx={{ maxWidth: 420 }}
        />
      </Stack>

      {selectedProduct ? (
        <DataGridCard
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
          searchPlaceholder="Search reviews..."
        />
      ) : (
        <EmptyState title="Select a product" description="Choose a product above to see its customer reviews." />
      )}
    </>
  );
}

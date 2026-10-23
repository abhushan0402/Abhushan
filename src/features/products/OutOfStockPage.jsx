import { useNavigate } from "react-router";
import { Avatar, Stack, Typography } from "@mui/material";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import { DataGridCard } from "../../components/common/DataGridCard";
import { StatusChip } from "../../components/common/StatusChip";
import { useServerTable } from "../../hooks/useServerTable";
import { useProducts } from "./api";
import { formatCurrency, formatDateTime } from "../../utils/format";

export default function OutOfStockPage() {
  const navigate = useNavigate();

  const table = useServerTable(useProducts, {
    sortBy: "updatedAt",
    sortDir: "desc",
    extraParams: { stockStatus: "out-of-stock" },
  });

  const columns = [
    {
      field: "name",
      headerName: "Product",
      flex: 1.4,
      minWidth: 190,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", height: "100%" }}>
          <Avatar variant="rounded" sx={{ bgcolor: "error.50", color: "error.main", width: 34, height: 34 }}>
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
      field: "isActive",
      headerName: "Status",
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => <StatusChip status={params.row.isActive === false ? "inactive" : "active"} />,
    },
    {
      field: "updatedAt",
      headerName: "Last updated",
      flex: 0.9,
      minWidth: 140,
      valueFormatter: (value) => formatDateTime(value),
    },
  ];

  return (
    <DataGridCard
      title="Out of stock"
      subtitle="Products with zero stock that need restocking"
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
      getRowHeight={() => "auto"}
      getEstimatedRowHeight={() => 68}
      onRowClick={(params) => navigate(`/products/${params.id}/edit`)}
    />
  );
}

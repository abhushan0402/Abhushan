import { useState } from "react";
import { useNavigate } from "react-router";
import { MenuItem, TextField, Typography } from "@mui/material";
import { DataGridCard } from "../../components/common/DataGridCard";
import { StatusChip } from "../../components/common/StatusChip";
import { useServerTable } from "../../hooks/useServerTable";
import { useOrders } from "./api";
import { formatCurrency, formatDate } from "../../utils/format";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");

  const table = useServerTable(useOrders, {
    sortBy: "placedAt",
    sortDir: "desc",
    extraParams: { status: statusFilter === "all" ? undefined : statusFilter },
  });

  const columns = [
    { field: "orderNumber", headerName: "Order", flex: 0.8, minWidth: 120 },
    { field: "customerName", headerName: "Customer", flex: 1, minWidth: 170 },
    {
      field: "total",
      headerName: "Amount",
      flex: 0.7,
      minWidth: 110,
      renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(params.row.total)}</Typography>,
    },
    {
      field: "paymentStatus",
      headerName: "Payment",
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => <StatusChip status={params.row.paymentStatus} />,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
    {
      field: "placedAt",
      headerName: "Placed on",
      flex: 0.7,
      minWidth: 120,
      valueFormatter: (value) => formatDate(value),
    },
  ];

  return (
    <DataGridCard
      title="Orders"
      subtitle="Track and fulfil customer orders"
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
      searchPlaceholder="Search by order number or customer..."
      onRowClick={(params) => navigate(`/orders/${params.id}`)}
      toolbarExtra={
        <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">All status</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </MenuItem>
          ))}
        </TextField>
      }
    />
  );
}

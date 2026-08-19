import { Typography } from "@mui/material";
import { DataGridCard } from "../../components/common/DataGridCard";
import { StatusChip } from "../../components/common/StatusChip";
import { useServerTable } from "../../hooks/useServerTable";
import { useInvoices } from "./api";
import { formatCurrency, formatDate } from "../../utils/format";

export default function BillingPage() {
  const table = useServerTable(useInvoices, { sortBy: "issuedAt", sortDir: "desc" });

  const columns = [
    { field: "invoiceNumber", headerName: "Invoice", flex: 0.9, minWidth: 150 },
    { field: "orderNumber", headerName: "Order", flex: 0.7, minWidth: 120 },
    { field: "customerName", headerName: "Customer", flex: 1, minWidth: 170 },
    {
      field: "amount",
      headerName: "Amount",
      flex: 0.7,
      minWidth: 110,
      renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(params.row.amount)}</Typography>,
    },
    {
      field: "amountPaid",
      headerName: "Paid",
      flex: 0.7,
      minWidth: 110,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.6,
      minWidth: 130,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
    {
      field: "dueDate",
      headerName: "Due date",
      flex: 0.7,
      minWidth: 120,
      valueFormatter: (value) => formatDate(value),
    },
  ];

  return (
    <DataGridCard
      title="Billing"
      subtitle="Invoices and payment tracking"
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
      searchPlaceholder="Search by invoice, order, customer..."
    />
  );
}

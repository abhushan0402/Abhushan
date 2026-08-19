import { Avatar, Stack, Typography } from "@mui/material";
import { DataGridCard } from "../../components/common/DataGridCard";
import { StatusChip } from "../../components/common/StatusChip";
import { useServerTable } from "../../hooks/useServerTable";
import { useCustomers } from "./api";
import { formatDate, getInitials } from "../../utils/format";

export default function CustomersPage() {
  const table = useServerTable(useCustomers, { sortBy: "createdAt", sortDir: "desc" });

  const columns = [
    {
      field: "name",
      headerName: "Customer",
      flex: 1.2,
      minWidth: 220,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", height: "100%" }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.100", color: "primary.dark" }}>
            {getInitials(params.row.name)}
          </Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{params.row.email}</Typography>
          </Stack>
        </Stack>
      ),
    },
    { field: "phone", headerName: "Phone", flex: 0.9, minWidth: 150 },
    { field: "addressCount", headerName: "Addresses", flex: 0.5, minWidth: 100 },
    {
      field: "createdAt",
      headerName: "Joined",
      flex: 0.7,
      minWidth: 120,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 0.6,
      minWidth: 110,
      renderCell: (params) => <StatusChip status={params.row.isActive === false ? "inactive" : "active"} />,
    },
  ];

  return (
    <DataGridCard
      title="Customers"
      subtitle="Your jewellery shop's clientele"
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
      searchPlaceholder="Search by name, email, phone..."
    />
  );
}

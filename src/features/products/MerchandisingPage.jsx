import { useState } from "react";
import { useNavigate } from "react-router";
import { Avatar, Chip, Stack, Tab, Tabs, Typography } from "@mui/material";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import { DataGridCard } from "../../components/common/DataGridCard";
import { StatusChip } from "../../components/common/StatusChip";
import { useServerTable } from "../../hooks/useServerTable";
import { useProducts } from "./api";
import { PRODUCT_TAGS } from "./productTags";
import { formatCurrency } from "../../utils/format";

export default function MerchandisingPage() {
  const navigate = useNavigate();
  const [tagIndex, setTagIndex] = useState(0);
  const activeTag = PRODUCT_TAGS[tagIndex];

  const table = useServerTable(useProducts, {
    sortBy: "name",
    sortDir: "asc",
    extraParams: { [activeTag.field]: true },
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
      headerName: "Other tags",
      flex: 0.9,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", alignItems: "center", height: "100%", py: 0.5 }}>
          {PRODUCT_TAGS.filter((tag) => tag.field !== activeTag.field && params.row[tag.field]).map((tag) => (
            <Chip key={tag.field} size="small" label={tag.label} color={tag.color} variant="outlined" />
          ))}
        </Stack>
      ),
    },
  ];

  return (
    <DataGridCard
      title="Featured & Arrivals"
      subtitle="See which products are marked trending, featured, best seller or new arrival"
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
      toolbarExtra={
        <Tabs
          value={tagIndex}
          onChange={(_, value) => setTagIndex(value)}
          sx={{ minHeight: 36, "& .MuiTab-root": { minHeight: 36, py: 0.5 } }}
        >
          {PRODUCT_TAGS.map((tag) => (
            <Tab key={tag.field} label={tag.label} />
          ))}
        </Tabs>
      }
    />
  );
}

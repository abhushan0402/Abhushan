import { useMemo } from "react";
import { Box, Card, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { DataGrid } from "@mui/x-data-grid";

export function DataGridCard({
  title,
  subtitle,
  action,
  rows,
  columns,
  rowCount,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortModel,
  onSortModelChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  toolbarExtra,
  onRowClick,
  getRowId,
  autoHeight = true,
}) {
  const paginationModel = useMemo(() => ({ page, pageSize }), [page, pageSize]);

  return (
    <Card sx={{ p: { xs: 1.5, md: 2 } }}>
      {(title || action) && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", mb: 2.5 }}
        >
          <Box>
            {title && (
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
        <TextField
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          size="small"
          sx={{ minWidth: { sm: 280 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", ml: { sm: "auto" }, width: { xs: "100%", sm: "auto" } }}>
          {toolbarExtra}
        </Stack>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        rowCount={rowCount}
        loading={loading}
        paginationMode="server"
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={(model) => queueMicrotask(() => onSortModelChange(model))}
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => {
          // Defer past DataGrid's own render/commit cycle - it can call this
          // synchronously while it is still rendering, which React flags as
          // "setState while rendering a different component".
          queueMicrotask(() => {
            if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
            if (model.page !== page) onPageChange(model.page);
          });
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        disableColumnMenu
        autoHeight={autoHeight}
        onRowClick={onRowClick}
        sx={{
          border: "none",
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
          "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": { outline: "none" },
          "& .MuiDataGrid-row": { cursor: onRowClick ? "pointer" : "default" },
        }}
      />
    </Card>
  );
}

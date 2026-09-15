import { Avatar, Card, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import { formatCurrency } from "../../utils/format";

export function TopSellingProductsCard({ data, loading }) {
  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Top selling products
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell align="right">Units sold</TableCell>
            <TableCell align="right">Revenue</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={3}>
                  <Skeleton height={32} />
                </TableCell>
              </TableRow>
            ))}
          {!loading && !data?.length && (
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  No sales yet
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            data?.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                    <Avatar variant="rounded" src={product.image} sx={{ width: 30, height: 30, bgcolor: "primary.50", color: "primary.main" }}>
                      <DiamondOutlinedIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {product.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">{product.unitsSold}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(product.revenue)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
}

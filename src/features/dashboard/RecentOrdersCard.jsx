import { Link as RouterLink } from "react-router";
import {
  Avatar,
  Card,
  Link,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { StatusChip } from "../../components/common/StatusChip";
import { formatCurrency, getInitials } from "../../utils/format";

export function RecentOrdersCard({ data, loading }) {
  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <div>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Recent orders
          </Typography>
        </div>
        <Link component={RouterLink} to="/orders" underline="hover" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
          View all
        </Link>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Order</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
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
          {!loading &&
            data?.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                    <Avatar sx={{ width: 30, height: 30, fontSize: "0.7rem", bgcolor: "primary.100", color: "primary.dark" }}>
                      {getInitials(order.customerName)}
                    </Avatar>
                    <div>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order.orderNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customerName}
                      </Typography>
                    </div>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(order.total)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={order.status} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
}

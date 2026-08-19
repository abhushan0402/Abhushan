import { useParams, useNavigate } from "react-router";
import { useSnackbar } from "notistack";
import {
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusChip } from "../../components/common/StatusChip";
import { useOrders } from "./api";
import { useAuth } from "../../auth/useAuth";
import { formatCurrency, formatDateTime } from "../../utils/format";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("orders:manage");
  const { enqueueSnackbar } = useSnackbar();

  const { data: order, isLoading } = useOrders.useDetail(id);
  const updateOrder = useOrders.usePatch({
    onSuccess: () => enqueueSnackbar("Order status updated", { variant: "success" }),
  });

  if (isLoading) {
    return (
      <Stack sx={{ alignItems: "center", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!order) return null;

  return (
    <>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed on ${formatDateTime(order.placedAt)}`}
        action={
          <Button startIcon={<ArrowBackOutlinedIcon />} color="inherit" onClick={() => navigate("/orders")}>
            Back to orders
          </Button>
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Items
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Unit price</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1} sx={{ maxWidth: 280, ml: "auto" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Discount</Typography>
                <Typography variant="body2">-{formatCurrency(order.discount)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Tax</Typography>
                <Typography variant="body2">{formatCurrency(order.tax)}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatCurrency(order.total)}</Typography>
              </Stack>
            </Stack>
          </Card>

          <Card sx={{ p: 2.5, mt: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Shipping address
            </Typography>
            <Typography variant="body2">{order.shippingAddress.line1}</Typography>
            <Typography variant="body2">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </Typography>
            <Typography variant="body2">{order.shippingAddress.country}</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2.5, mb: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Customer
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customerName}</Typography>
            <Typography variant="body2" color="text.secondary">{order.customerEmail}</Typography>
          </Card>

          <Card sx={{ p: 2.5, mb: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Payment
            </Typography>
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Method</Typography>
              <Typography variant="body2">{order.paymentMethod}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <StatusChip status={order.paymentStatus} />
            </Stack>
          </Card>

          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Order status
            </Typography>
            {canManage ? (
              <TextField
                select
                fullWidth
                value={order.status}
                onChange={(e) => updateOrder.mutate({ id: order.id, data: { status: e.target.value } })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <StatusChip status={order.status} />
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

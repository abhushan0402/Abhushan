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
import { useOrders, ORDER_STATUS_OPTIONS } from "./api";
import { useAuth } from "../../auth/useAuth";
import { formatCurrency, formatDateTime } from "../../utils/format";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("orders:manage");
  const { enqueueSnackbar } = useSnackbar();

  const { data: order, isLoading } = useOrders.useDetail(id);
  const updateStatus = useOrders.useUpdateStatus({
    onSuccess: () => enqueueSnackbar("Order status updated", { variant: "success" }),
    onError: () => enqueueSnackbar("Failed to update order status", { variant: "error" }),
  });

  if (isLoading) {
    return (
      <Stack sx={{ alignItems: "center", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!order) return null;

  const address = order.deliveryAddress ?? {};

  return (
    <>
      <PageHeader
        title={`Order #${order.id?.slice(-8).toUpperCase()}`}
        subtitle={`Placed on ${formatDateTime(order.createdAt)}`}
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
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Weight (g)</TableCell>
                  <TableCell>Purity</TableCell>
                  <TableCell align="right">Price/unit</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(order.items ?? []).map((item, index) => (
                  <TableRow key={item.productId ?? index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{item.weightGrams ?? "—"}</TableCell>
                    <TableCell>{item.purity ?? "—"}</TableCell>
                    <TableCell align="right">{formatCurrency(item.pricePerUnit)}</TableCell>
                    <TableCell align="right">{formatCurrency((item.pricePerUnit ?? 0) * (item.quantity ?? 0))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1} sx={{ maxWidth: 280, ml: "auto" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatCurrency(order.totalAmount)}</Typography>
              </Stack>
            </Stack>
          </Card>

          <Card sx={{ p: 2.5, mt: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Delivery address
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{address.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">{address.mobile}</Typography>
            <Typography variant="body2">{address.addressLine1}</Typography>
            {address.addressLine2 && <Typography variant="body2">{address.addressLine2}</Typography>}
            <Typography variant="body2">
              {address.city}, {address.state} {address.pincode}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2.5, mb: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Customer
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customerName}</Typography>
            <Typography variant="body2" color="text.secondary">{order.customerEmail}</Typography>
            <Typography variant="body2" color="text.secondary">{order.customerPhone}</Typography>
          </Card>

          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Order status
            </Typography>
            {canManage ? (
              <TextField
                select
                fullWidth
                value={order.orderStatus}
                onChange={(e) => updateStatus.mutate({ id: order.id, data: { orderStatus: e.target.value } })}
              >
                {ORDER_STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <StatusChip status={order.orderStatus} />
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { StatusChip } from "../../components/common/StatusChip";
import { useCustomers } from "./api";
import { formatCurrency, formatDate, formatDateTime, getInitials } from "../../utils/format";

export function CustomerDetailDialog({ customerId, onClose }) {
  const { data: customer, isLoading } = useCustomers.useDetail(customerId);
  const updateStatus = useCustomers.useUpdateStatus();

  return (
    <Dialog open={Boolean(customerId)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700 }}>
        Customer details
        <IconButton size="small" onClick={onClose}>
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {isLoading || !customer ? (
          <Stack sx={{ alignItems: "center", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={3} sx={{ pb: 1 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Avatar src={customer.profileImage} sx={{ width: 56, height: 56, bgcolor: "primary.100", color: "primary.dark" }}>
                {getInitials(customer.name)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                  {customer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {customer.email}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <StatusChip status={customer.isActive === false ? "inactive" : "active"} />
                <Switch
                  size="small"
                  checked={customer.isActive !== false}
                  disabled={updateStatus.isPending}
                  onChange={(e) => updateStatus.mutate({ id: customer.id, isActive: e.target.checked })}
                />
              </Stack>
            </Stack>

            <Stack direction="row" spacing={4} sx={{ flexWrap: "wrap", rowGap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{customer.phone ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Gender</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{customer.gender ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Date of birth</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {customer.dateOfBirth ? formatDate(customer.dateOfBirth) : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Joined</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(customer.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total orders</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{customer.totalOrders}</Typography>
              </Box>
              {customer.totalSpent != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Total spent</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(customer.totalSpent)}</Typography>
                </Box>
              )}
            </Stack>

            {customer.addresses.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Addresses
                  </Typography>
                  <Stack spacing={1.5}>
                    {customer.addresses.map((address, index) => (
                      <Box key={address.id ?? address._id ?? index} sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                          <Chip size="small" label={address.label ?? "Address"} variant="outlined" />
                          {address.isDefault && <Chip size="small" label="Default" color="primary" />}
                        </Stack>
                        <Typography variant="body2">{address.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {[address.addressLine1, address.addressLine2, address.city, address.state, address.pincode]
                            .filter(Boolean)
                            .join(", ")}
                        </Typography>
                        {address.mobile && (
                          <Typography variant="caption" color="text.secondary">{address.mobile}</Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Order history
              </Typography>
              {customer.orders.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No orders yet.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customer.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.createdAt ? formatDateTime(order.createdAt) : "—"}</TableCell>
                        <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <StatusChip status={order.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

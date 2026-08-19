import { Grid } from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useDashboardSummary } from "./api";
import { StatCard } from "./StatCard";
import { SalesTrendCard } from "./SalesTrendCard";
import { RevenueByCategoryCard } from "./RevenueByCategoryCard";
import { OrderStatusCard } from "./OrderStatusCard";
import { RecentOrdersCard } from "./RecentOrdersCard";
import { formatCurrency } from "../../utils/format";

export default function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Today's Sales" value={formatCurrency(data?.todaysSales ?? 0)} icon={PaymentsOutlinedIcon} loading={isLoading} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="This Month" value={formatCurrency(data?.monthSales ?? 0)} icon={CalendarMonthOutlinedIcon} loading={isLoading} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          label="Pending Orders"
          value={data?.pendingOrders ?? 0}
          caption="Awaiting processing"
          icon={PendingActionsOutlinedIcon}
          loading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          label="Low Stock SKUs"
          value={data?.lowStockSkus ?? 0}
          caption="Need restocking soon"
          icon={WarningAmberOutlinedIcon}
          accent="error.main"
          loading={isLoading}
        />
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <SalesTrendCard data={data?.salesTrend} loading={isLoading} />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <OrderStatusCard data={data?.orderStatusBreakdown} loading={isLoading} />
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <RevenueByCategoryCard data={data?.revenueByCategory} loading={isLoading} />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <RecentOrdersCard data={data?.recentOrders} loading={isLoading} />
      </Grid>
    </Grid>
  );
}

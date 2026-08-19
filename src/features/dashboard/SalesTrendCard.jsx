import { Box, Card, Skeleton, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { colors } from "../../app/theme";
import { formatCurrency } from "../../utils/format";

export function SalesTrendCard({ data, loading }) {
  const months = data?.map((d) => d.month) ?? [];
  const revenue = data?.map((d) => d.revenue) ?? [];

  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Sales trend
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Revenue over the last 12 months
      </Typography>

      {loading ? (
        <Skeleton variant="rounded" height={280} />
      ) : (
        <Box sx={{ width: "100%", height: 280 }}>
          <LineChart
            height={280}
            series={[
              {
                data: revenue,
                area: true,
                color: colors.gold[500],
                showMark: false,
                curve: "monotoneX",
                valueFormatter: (v) => (v == null ? "" : formatCurrency(v, true)),
              },
            ]}
            xAxis={[{ scaleType: "point", data: months, tickLabelStyle: { fontSize: 11 } }]}
            yAxis={[{ valueFormatter: (v) => formatCurrency(v, true), tickLabelStyle: { fontSize: 11 } }]}
            grid={{ horizontal: true }}
            margin={{ left: 56, right: 16, top: 16, bottom: 24 }}
            slotProps={{ legend: { hidden: true } }}
            sx={{
              "& .MuiAreaElement-root": { fillOpacity: 0.25 },
              "& .MuiChartsAxis-line": { stroke: "transparent" },
              "& .MuiChartsAxis-tick": { stroke: "transparent" },
            }}
          />
        </Box>
      )}
    </Card>
  );
}

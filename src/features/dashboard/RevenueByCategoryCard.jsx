import { Box, Card, Skeleton, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { theme } from "../../app/theme";
import { formatCurrency } from "../../utils/format";

export function RevenueByCategoryCard({ data, loading }) {
  const categories = data?.map((d) => d.category) ?? [];
  const revenue = data?.map((d) => d.revenue) ?? [];

  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Revenue by category
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Top performing collections
      </Typography>

      {loading ? (
        <Skeleton variant="rounded" height={280} />
      ) : (
        <Box sx={{ width: "100%", height: 280 }}>
          <BarChart
            height={280}
            series={[
              {
                data: revenue,
                color: theme.palette.primary.main,
                valueFormatter: (v) => (v == null ? "" : formatCurrency(v, true)),
              },
            ]}
            xAxis={[{ scaleType: "band", data: categories, tickLabelStyle: { fontSize: 10 } }]}
            yAxis={[{ valueFormatter: (v) => formatCurrency(v, true), tickLabelStyle: { fontSize: 11 } }]}
            grid={{ horizontal: true }}
            borderRadius={8}
            margin={{ left: 56, right: 16, top: 16, bottom: 48 }}
            slotProps={{ legend: { hidden: true } }}
            sx={{ "& .MuiChartsAxis-line": { stroke: "transparent" }, "& .MuiChartsAxis-tick": { stroke: "transparent" } }}
          />
        </Box>
      )}
    </Card>
  );
}

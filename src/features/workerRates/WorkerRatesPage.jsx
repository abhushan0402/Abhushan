import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSnackbar } from "notistack";
import { Button, Card, CircularProgress, Grid, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { PageHeader } from "../../components/common/PageHeader";
import { useWorkerRates, RATE_CODES } from "./api";
import { useAuth } from "../../auth/useAuth";
import { formatDateTime } from "../../utils/format";

const schema = z.object({
  gstPercentage: z.coerce.number().min(0, "Can't be negative").max(100, "Can't exceed 100"),
  ...Object.fromEntries(RATE_CODES.map((r) => [r.code, z.coerce.number().min(0, "Rate can't be negative")])),
});

const GOLD_RATES = RATE_CODES.filter((r) => r.code.startsWith("gold_"));
const SILVER_RATES = RATE_CODES.filter((r) => r.code.startsWith("silver_"));

export default function WorkerRatesPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("workerRates:manage");
  const { enqueueSnackbar } = useSnackbar();

  const { data: rates, isLoading } = useWorkerRates.useDetail();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { gstPercentage: "", ...Object.fromEntries(RATE_CODES.map((r) => [r.code, ""])) },
  });

  useEffect(() => {
    if (rates) {
      reset({
        gstPercentage: rates.gstPercentage,
        ...Object.fromEntries(RATE_CODES.map((r) => [r.code, rates.rateByCode[r.code] ?? ""])),
      });
    }
  }, [rates, reset]);

  const updateRates = useWorkerRates.useUpdate({
    onSuccess: (data) => enqueueSnackbar(data?.message ?? "Worker rates updated", { variant: "success" }),
    onError: (error) => enqueueSnackbar(error?.response?.data?.message ?? "Failed to update worker rates", { variant: "error" }),
  });

  const onSubmit = (values) => {
    const { gstPercentage, ...rateValues } = values;
    updateRates.mutate({
      rates: RATE_CODES.map((r) => ({ code: r.code, ratePerGram: rateValues[r.code] })),
      gstPercentage,
    });
  };

  if (isLoading) {
    return (
      <Stack sx={{ alignItems: "center", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <>
      <PageHeader
        title="Worker rates"
        subtitle={rates?.updatedAt ? `Last updated ${formatDateTime(rates.updatedAt)}` : "Making-charge rates per gram, by category"}
      />

      <Card sx={{ p: { xs: 2, md: 3 }, maxWidth: 760 }} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Gold
        </Typography>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {GOLD_RATES.map((r) => (
            <Grid key={r.code} size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label={r.label}
                type="number"
                fullWidth
                disabled={!canManage}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }, htmlInput: { step: "any" } }}
                error={Boolean(errors[r.code])}
                helperText={errors[r.code]?.message}
                {...register(r.code)}
              />
            </Grid>
          ))}
        </Grid>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Silver
        </Typography>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {SILVER_RATES.map((r) => (
            <Grid key={r.code} size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label={r.label}
                type="number"
                fullWidth
                disabled={!canManage}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }, htmlInput: { step: "any" } }}
                error={Boolean(errors[r.code])}
                helperText={errors[r.code]?.message}
                {...register(r.code)}
              />
            </Grid>
          ))}
        </Grid>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Tax
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="GST"
              type="number"
              fullWidth
              disabled={!canManage}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }, htmlInput: { step: "any" } }}
              error={Boolean(errors.gstPercentage)}
              helperText={errors.gstPercentage?.message}
              {...register("gstPercentage")}
            />
          </Grid>
        </Grid>

        {canManage && (
          <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 3 }}>
            <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />} loading={updateRates.isPending}>
              Save rates
            </Button>
          </Stack>
        )}
      </Card>
    </>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSnackbar } from "notistack";
import { Button, Card, CircularProgress, Grid, InputAdornment, Stack, TextField } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { PageHeader } from "../../components/common/PageHeader";
import { useMetalRates } from "./api";
import { useAuth } from "../../auth/useAuth";
import { formatDateTime } from "../../utils/format";

const schema = z.object({
  gold24kPer10g: z.coerce.number().min(0, "Rate can't be negative"),
  gold22kPer10g: z.coerce.number().min(0, "Rate can't be negative"),
  silver9999PerKg: z.coerce.number().min(0, "Rate can't be negative"),
});

export default function MetalRatesPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("metalRates:manage");
  const { enqueueSnackbar } = useSnackbar();

  const { data: rates, isLoading } = useMetalRates.useDetail();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { gold24kPer10g: "", gold22kPer10g: "", silver9999PerKg: "" },
  });

  useEffect(() => {
    if (rates) {
      reset({
        gold24kPer10g: rates.gold24kPer10g,
        gold22kPer10g: rates.gold22kPer10g,
        silver9999PerKg: rates.silver9999PerKg,
      });
    }
  }, [rates, reset]);

  const updateRates = useMetalRates.useUpdate({
    onSuccess: (data) => enqueueSnackbar(data?.message ?? "Metal rates updated", { variant: "success" }),
    onError: (error) => enqueueSnackbar(error?.response?.data?.message ?? "Failed to update metal rates", { variant: "error" }),
  });

  const onSubmit = (values) => updateRates.mutate(values);

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
        title="Metal rates"
        subtitle={rates?.updatedAt ? `Last updated ${formatDateTime(rates.updatedAt)}` : "Gold and silver pricing used across the storefront"}
      />

      <Card sx={{ p: { xs: 2, md: 3 }, maxWidth: 640 }} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Gold 24K (per 10g)"
              type="number"
              fullWidth
              disabled={!canManage}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }, htmlInput: { step: "any" } }}
              error={Boolean(errors.gold24kPer10g)}
              helperText={errors.gold24kPer10g?.message}
              {...register("gold24kPer10g")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Gold 22K (per 10g)"
              type="number"
              fullWidth
              disabled={!canManage}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }, htmlInput: { step: "any" } }}
              error={Boolean(errors.gold22kPer10g)}
              helperText={errors.gold22kPer10g?.message}
              {...register("gold22kPer10g")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Silver 99.99% (per kg)"
              type="number"
              fullWidth
              disabled={!canManage}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }, htmlInput: { step: "any" } }}
              error={Boolean(errors.silver9999PerKg)}
              helperText={errors.silver9999PerKg?.message}
              {...register("silver9999PerKg")}
            />
          </Grid>

          {canManage && (
            <Grid size={12}>
              <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />} loading={updateRates.isPending}>
                  Save rates
                </Button>
              </Stack>
            </Grid>
          )}
        </Grid>
      </Card>
    </>
  );
}

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSnackbar } from "notistack";
import { Alert, Button, Card, CircularProgress, Grid, Stack, Tab, Tabs, TextField } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { PageHeader } from "../../components/common/PageHeader";
import { useAppVersion } from "./api";
import { useAuth } from "../../auth/useAuth";

const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;
const semver = z.string().regex(SEMVER_REGEX, "Use major.minor.patch, e.g. 1.2.3");

const schema = z.object({
  latestVersion: semver,
  minimumSupportedVersion: semver,
  playStoreUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  appStoreUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  forceUpdateMessage: z.string().optional(),
});

const emptyDefaults = {
  latestVersion: "",
  minimumSupportedVersion: "",
  playStoreUrl: "",
  appStoreUrl: "",
  forceUpdateMessage: "",
};

export default function AppVersionPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("appVersion:manage");
  const { enqueueSnackbar } = useSnackbar();
  const [platform, setPlatform] = useState("android");

  const { data: current, isLoading } = useAppVersion.useCurrent(platform);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: emptyDefaults });

  useEffect(() => {
    if (platform === "android" && current) {
      reset({
        latestVersion: current.latestVersion ?? "",
        minimumSupportedVersion: current.minimumSupportedVersion ?? "",
        playStoreUrl: current.playStoreUrl ?? "",
        appStoreUrl: "",
        forceUpdateMessage: current.forceUpdateMessage ?? "",
      });
    } else if (platform === "ios") {
      // No GET endpoint exists for iOS yet, so there's nothing to prefill from.
      reset(emptyDefaults);
    }
  }, [platform, current, reset]);

  const updateVersion = useAppVersion.useUpdate({
    onSuccess: (data) => enqueueSnackbar(data?.message ?? "App version updated", { variant: "success" }),
    onError: (error) => enqueueSnackbar(error?.response?.data?.message ?? "Failed to update app version", { variant: "error" }),
  });

  const onSubmit = (values) => {
    const payload = { platform, latestVersion: values.latestVersion, minimumSupportedVersion: values.minimumSupportedVersion };
    if (platform === "android" && values.playStoreUrl) payload.playStoreUrl = values.playStoreUrl;
    if (platform === "ios" && values.appStoreUrl) payload.appStoreUrl = values.appStoreUrl;
    if (values.forceUpdateMessage) payload.forceUpdateMessage = values.forceUpdateMessage;
    updateVersion.mutate(payload);
  };

  return (
    <>
      <PageHeader title="App version & force update" subtitle="Control the minimum app version customers are allowed to use" />

      <Alert severity="warning" sx={{ mb: 3, maxWidth: 640 }}>
        Any installed version below &ldquo;Minimum supported version&rdquo; gets a non-dismissible update screen - the app
        becomes unusable for those customers until they update. Double-check both values before saving.
      </Alert>

      <Card sx={{ p: { xs: 2, md: 3 }, maxWidth: 640 }}>
        <Tabs value={platform} onChange={(_, value) => setPlatform(value)} sx={{ mb: 3 }}>
          <Tab label="Android" value="android" />
          <Tab label="iOS" value="ios" />
        </Tabs>

        {isLoading && platform === "android" ? (
          <Stack sx={{ alignItems: "center", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Latest version"
                  placeholder="1.2.0"
                  fullWidth
                  disabled={!canManage}
                  error={Boolean(errors.latestVersion)}
                  helperText={errors.latestVersion?.message ?? "Shown as an optional update prompt"}
                  {...register("latestVersion")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Minimum supported version"
                  placeholder="1.2.0"
                  fullWidth
                  disabled={!canManage}
                  error={Boolean(errors.minimumSupportedVersion)}
                  helperText={errors.minimumSupportedVersion?.message ?? "Below this, the update is forced"}
                  {...register("minimumSupportedVersion")}
                />
              </Grid>
              <Grid size={12}>
                {platform === "android" ? (
                  <TextField
                    label="Play Store URL"
                    placeholder="https://play.google.com/store/apps/details?id=..."
                    fullWidth
                    disabled={!canManage}
                    error={Boolean(errors.playStoreUrl)}
                    helperText={errors.playStoreUrl?.message}
                    {...register("playStoreUrl")}
                  />
                ) : (
                  <TextField
                    label="App Store URL"
                    placeholder="https://apps.apple.com/app/..."
                    fullWidth
                    disabled={!canManage}
                    error={Boolean(errors.appStoreUrl)}
                    helperText={errors.appStoreUrl?.message}
                    {...register("appStoreUrl")}
                  />
                )}
              </Grid>
              <Grid size={12}>
                <Controller
                  name="forceUpdateMessage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Force update message (optional)"
                      placeholder="A new version is available with important fixes. Please update to continue."
                      fullWidth
                      multiline
                      minRows={2}
                      disabled={!canManage}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {canManage && (
              <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />} loading={updateVersion.isPending}>
                  Save {platform === "android" ? "Android" : "iOS"} settings
                </Button>
              </Stack>
            )}
          </Stack>
        )}
      </Card>
    </>
  );
}

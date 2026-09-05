import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigate, useLocation, useNavigate } from "react-router";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "./useAuth";
import logo from "../assets/logo.png";

const MOBILE_PATTERN = /^[6-9]\d{9}$/;

const schema = z.object({
  identifier: z
    .string()
    .min(1, "Email or mobile number is required")
    .refine(
      (value) => z.string().email().safeParse(value).success || MOBILE_PATTERN.test(value),
      "Enter a valid email address or 10-digit mobile number",
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be at most 50 characters"),
  rememberMe: z.boolean(),
});

export default function LoginPage() {
  const { login, isLoggingIn, isAuthenticated, loginError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "", rememberMe: true },
  });

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate("/", { replace: true });
    } catch {
      // surfaced via loginError from useAuth()
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top left, #f5edf7 0%, #f8f5ef 45%, #f8f5ef 100%)",
        p: 2,
      }}
    >
      <Paper elevation={0} sx={{ width: "100%", maxWidth: 420, p: { xs: 3, sm: 5 }, borderRadius: 2 }}>
        <Stack spacing={1} sx={{ mb: 4, alignItems: "center" }}>
          <Box component="img" src={logo} alt="Abhushan Vatika" sx={{ width: 64, height: 64, objectFit: "contain" }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Abhushan Vatika
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to the Admin Console
          </Typography>
        </Stack>

        {loginError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {loginError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            <TextField
              label="Email or mobile number"
              type="text"
              fullWidth
              autoComplete="username"
              error={Boolean(errors.identifier)}
              helperText={errors.identifier?.message}
              {...register("identifier")}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register("password")}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <FormControlLabel
                control={<Checkbox size="small" {...register("rememberMe")} defaultChecked />}
                label="Remember me"
              />
              <Typography variant="body2" color="primary.main" sx={{ cursor: "pointer", fontWeight: 600 }}>
                Forgot password?
              </Typography>
            </Stack>
            <Button type="submit" variant="contained" size="large" fullWidth loading={isLoggingIn}>
              Sign in
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

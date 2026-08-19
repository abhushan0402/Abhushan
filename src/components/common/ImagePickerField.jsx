import { useMemo } from "react";
import { Avatar, Button, Stack, Typography } from "@mui/material";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";

/**
 * A "choose image" file picker for react-hook-form: `register(name)` on a hidden
 * native file input, with a thumbnail preview of either the newly picked file or
 * (when editing) the image already stored for the row.
 */
export function ImagePickerField({ register, name, selectedFile, existingImageUrl, label = "Choose image" }) {
  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile]);
  const src = previewUrl ?? existingImageUrl;

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <Avatar variant="rounded" src={src} sx={{ width: 56, height: 56 }} />
      <Button component="label" variant="outlined" startIcon={<UploadOutlinedIcon />}>
        {selectedFile ? "Change image" : existingImageUrl ? "Replace image" : label}
        <input type="file" accept="image/*" hidden {...register(name)} />
      </Button>
      {selectedFile && (
        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
          {selectedFile.name}
        </Typography>
      )}
    </Stack>
  );
}

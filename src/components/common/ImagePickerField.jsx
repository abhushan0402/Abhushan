import { useMemo, useRef } from "react";
import { Avatar, Button, IconButton, Stack, Typography } from "@mui/material";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

/**
 * A "choose image" file picker for react-hook-form: `register(name)` on a hidden
 * native file input, with a thumbnail preview of either the newly picked file or
 * (when editing) the image already stored for the row. `setValue` is needed
 * alongside `register` because clearing a native file input has to happen
 * imperatively on the DOM node - react-hook-form's own state can't do it alone.
 */
export function ImagePickerField({ register, setValue, name, selectedFile, existingImageUrl, label = "Choose image" }) {
  const fileInputRef = useRef(null);
  const { ref: registerRef, ...inputProps } = register(name);

  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile]);
  const src = previewUrl ?? existingImageUrl;

  const handleRemove = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setValue(name, null, { shouldDirty: true });
  };

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Avatar variant="rounded" src={src} sx={{ width: 56, height: 56 }} />
      <Button component="label" variant="outlined" startIcon={<UploadOutlinedIcon />}>
        {selectedFile ? "Change image" : existingImageUrl ? "Replace image" : label}
        <input
          type="file"
          accept="image/*"
          hidden
          {...inputProps}
          ref={(el) => {
            fileInputRef.current = el;
            registerRef(el);
          }}
        />
      </Button>
      {selectedFile && (
        <>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
            {selectedFile.name}
          </Typography>
          <IconButton size="small" onClick={handleRemove} aria-label="Remove selected image">
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Stack>
  );
}

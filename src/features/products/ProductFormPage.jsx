import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSnackbar } from "notistack";
import { Button, Card, Checkbox, FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { PageHeader } from "../../components/common/PageHeader";
import { ImagePickerField } from "../../components/common/ImagePickerField";
import { useProducts } from "./api";
import { useCategories } from "../categories/api";
import { useSubCategories } from "../subcategories/api";

// Per the article-details reference sheet, gold/silver products are specified by
// weight; 925-imported products are priced flat with no weight tracked (existing
// catalogue data confirms this - imported products are created without a weight).
const UNWEIGHED_METAL_TYPES = ["925-imported"];

const METAL_TYPE_OPTIONS = ["gold", "silver", "925-imported"];
const GENDER_OPTIONS = ["men", "women", "kids", "gifting"];

// Only name/category/subcategory are mandatory - everything else is optional.
const schema = z.object({
  name: z.string().min(2, "Product name is required"),
  sku: z.string().optional(),
  categoryId: z.string().min(1, "Select a category"),
  subCategoryId: z.string().min(1, "Select a subcategory"),
  metalType: z.string().optional(),
  gender: z.string().optional(),
  productType: z.string().optional(),
  image: z.any().optional(),
  previewImage1: z.any().optional(),
  previewImage2: z.any().optional(),
  previewImage3: z.any().optional(),
  description: z.string().optional(),
  weight: z.coerce.number().min(0, "Weight can't be negative").optional(),
  purity: z.coerce.number().min(0, "Purity can't be negative").optional(),
  basePrice: z.coerce.number().min(0, "Price can't be negative").optional(),
  stock: z.coerce.number().min(0, "Stock can't be negative").optional(),
  isBestSeller: z.boolean(),
  isFeatured: z.boolean(),
  isTrending: z.boolean(),
  isNewArrival: z.boolean(),
  isActive: z.boolean(),
});

const emptyDefaults = {
  name: "",
  sku: "",
  categoryId: "",
  subCategoryId: "",
  metalType: "",
  gender: "",
  productType: "",
  description: "",
  weight: "",
  purity: "",
  basePrice: "",
  stock: "",
  isBestSeller: false,
  isFeatured: false,
  isTrending: false,
  isNewArrival: false,
  isActive: true,
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: product, isLoading: loadingProduct } = useProducts.useDetail(id);
  const { data: categoriesData } = useCategories.useList({ pageSize: 100 });
  const categories = categoriesData?.data ?? [];
  const { data: subCategoriesData } = useSubCategories.useList({ pageSize: 100 });
  const subCategories = useMemo(() => subCategoriesData?.data ?? [], [subCategoriesData]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: emptyDefaults });

  const selectedCategoryId = watch("categoryId");
  const subCategoryOptions = useMemo(
    () => subCategories.filter((sc) => sc.categoryId === selectedCategoryId),
    [subCategories, selectedCategoryId],
  );

  const selectedMetalType = watch("metalType");
  const showWeight = !UNWEIGHED_METAL_TYPES.includes(selectedMetalType);
  const selectedImageFile = watch("image")?.[0];
  const selectedPreviewFile1 = watch("previewImage1")?.[0];
  const selectedPreviewFile2 = watch("previewImage2")?.[0];
  const selectedPreviewFile3 = watch("previewImage3")?.[0];

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        metalType: product.metalType,
        gender: product.gender,
        productType: product.productType,
        description: product.description ?? "",
        weight: product.weight,
        purity: product.purity,
        basePrice: product.basePrice,
        stock: product.stock,
        isBestSeller: product.isBestSeller ?? false,
        isFeatured: product.isFeatured ?? false,
        isTrending: product.isTrending ?? false,
        isNewArrival: product.isNewArrival ?? false,
        isActive: product.isActive ?? true,
      });
    }
  }, [product, reset]);

  const createProduct = useProducts.useCreate({
    onSuccess: (data) => {
      enqueueSnackbar(data?.message ?? "Product created", { variant: "success" });
      navigate("/products");
    },
    onError: (error) => enqueueSnackbar(error?.response?.data?.message ?? "Failed to create product", { variant: "error" }),
  });

  const updateProduct = useProducts.useUpdate({
    onSuccess: (data) => {
      enqueueSnackbar(data?.message ?? "Product updated", { variant: "success" });
      navigate("/products");
    },
    onError: (error) => enqueueSnackbar(error?.response?.data?.message ?? "Failed to update product", { variant: "error" }),
  });

  const onSubmit = (values) => {
    const { image, previewImage1, previewImage2, previewImage3, ...payload } = values;
    // Thumbnail first, then up to 3 preview images - same order the gallery below
    // the main image should render them in.
    const imageFiles = [image?.[0], previewImage1?.[0], previewImage2?.[0], previewImage3?.[0]].filter(Boolean);
    if (imageFiles.length) payload.images = imageFiles;
    if (isEdit) {
      updateProduct.mutate({ id, data: payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  if (isEdit && loadingProduct) return null;

  return (
    <>
      <PageHeader title={isEdit ? "Edit product" : "Add product"} subtitle="Jewellery catalogue" />

      <Card sx={{ p: { xs: 2, md: 3 } }} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Product name" fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} {...register("name")} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="SKU" fullWidth error={Boolean(errors.sku)} helperText={errors.sku?.message} {...register("sku")} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Category" fullWidth error={Boolean(errors.categoryId)} helperText={errors.categoryId?.message}>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="subCategoryId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Subcategory"
                  fullWidth
                  disabled={!selectedCategoryId}
                  error={Boolean(errors.subCategoryId)}
                  helperText={errors.subCategoryId?.message}
                >
                  {subCategoryOptions.map((sc) => (
                    <MenuItem key={sc.id} value={sc.id}>
                      {sc.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              label="Metal type"
              fullWidth
              defaultValue=""
              error={Boolean(errors.metalType)}
              helperText={errors.metalType?.message}
              {...register("metalType")}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {METAL_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              label="Gender"
              fullWidth
              defaultValue=""
              error={Boolean(errors.gender)}
              helperText={errors.gender?.message}
              {...register("gender")}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {GENDER_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Product type"
              fullWidth
              placeholder="e.g. rings, chains, bangles"
              error={Boolean(errors.productType)}
              helperText={errors.productType?.message}
              {...register("productType")}
            />
          </Grid>

          {showWeight && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Weight (grams)"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { step: "any" } }}
                error={Boolean(errors.weight)}
                helperText={errors.weight?.message}
                {...register("weight")}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Purity"
              type="number"
              fullWidth
              placeholder="91.6, 92.5, 99.9..."
              slotProps={{ htmlInput: { step: "any" } }}
              error={Boolean(errors.purity)}
              helperText={errors.purity?.message}
              {...register("purity")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField label="Base price (₹)" type="number" fullWidth error={Boolean(errors.basePrice)} helperText={errors.basePrice?.message} {...register("basePrice")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField label="Stock quantity" type="number" fullWidth error={Boolean(errors.stock)} helperText={errors.stock?.message} {...register("stock")} />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Main image (thumbnail)
            </Typography>
            <ImagePickerField
              register={register}
              setValue={setValue}
              name="image"
              selectedFile={selectedImageFile}
              existingImageUrl={product?.images?.[0]}
              label="Choose thumbnail"
            />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Preview images
            </Typography>
            <Stack spacing={1.5}>
              <ImagePickerField
                register={register}
                setValue={setValue}
                name="previewImage1"
                selectedFile={selectedPreviewFile1}
                existingImageUrl={product?.images?.[1]}
                label="Choose preview image 1"
              />
              <ImagePickerField
                register={register}
                setValue={setValue}
                name="previewImage2"
                selectedFile={selectedPreviewFile2}
                existingImageUrl={product?.images?.[2]}
                label="Choose preview image 2"
              />
              <ImagePickerField
                register={register}
                setValue={setValue}
                name="previewImage3"
                selectedFile={selectedPreviewFile3}
                existingImageUrl={product?.images?.[3]}
                label="Choose preview image 3"
              />
            </Stack>
          </Grid>

          <Grid size={12}>
            <TextField label="Description" fullWidth multiline minRows={3} {...register("description")} />
          </Grid>

          <Grid size={12}>
            <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
              <Controller
                name="isBestSeller"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Best seller"
                  />
                )}
              />
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Featured"
                  />
                )}
              />
              <Controller
                name="isTrending"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Trending"
                  />
                )}
              />
              <Controller
                name="isNewArrival"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="New arrival"
                  />
                )}
              />
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Active"
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid size={12}>
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
              <Button color="inherit" onClick={() => navigate("/products")}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                loading={createProduct.isPending || updateProduct.isPending}
              >
                {isEdit ? "Save changes" : "Create product"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </>
  );
}

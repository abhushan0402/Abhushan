// Single source of truth for the merchandising tag filters/chips shared by
// ProductsPage and MerchandisingPage - each tag maps a product boolean field
// to the filter value sent to the API and the chip shown in the UI.
export const PRODUCT_TAGS = [
  { field: "isTrending", filterValue: "trending", label: "Trending", color: "warning" },
  { field: "isFeatured", filterValue: "featured", label: "Featured", color: "info" },
  { field: "isBestSeller", filterValue: "bestseller", label: "Best seller", color: "success" },
  { field: "isNewArrival", filterValue: "newarrival", label: "New arrival", color: "primary" },
];

const CURRENCY = import.meta.env.VITE_CURRENCY || "NGN";

export const money = (value = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const shortDate = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const finalPrice = (product) =>
  product?.priceAfterDiscount > 0 ? product.priceAfterDiscount : product?.price || 0;

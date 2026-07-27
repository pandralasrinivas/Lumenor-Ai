export const getDisplayPrice = (product) => product.discountPrice || product.price || 0;

export const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const getDiscountPercent = (product) => {
  if (!product?.discountPrice || !product?.price) {
    return 0;
  }

  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
};

export const getProductColors = (product) => {
  return [...new Set(product?.variants?.map((variant) => variant.color).filter(Boolean))];
};

export const getProductSizes = (product) => {
  return [
    ...new Set(
      product?.variants
        ?.flatMap((variant) => variant.sizes?.map((size) => size.size) || [])
        .filter(Boolean),
    ),
  ];
};

const swatchMap = {
  black: "#111111",
  white: "#f8f6f1",
  cream: "#efe4d3",
  ivory: "#f7f2e8",
  beige: "#d7c2a2",
  tan: "#b98256",
  brown: "#7a4a24",
  camel: "#b88752",
  cognac: "#8d4f24",
  mocha: "#6b4f42",
  gray: "#9aa0a6",
  grey: "#9aa0a6",
  silver: "#c3c9cf",
  charcoal: "#4b4f54",
  navy: "#243b67",
  blue: "#4b79c9",
  sky: "#a6d3ef",
  denim: "#7395c7",
  green: "#5e8f66",
  olive: "#78885b",
  sage: "#b4c5ad",
  mint: "#b9e0cf",
  red: "#d74d48",
  burgundy: "#7f283b",
  pink: "#ee9bb2",
  blush: "#f4c5c3",
  peach: "#f0b39a",
  orange: "#ea8b47",
  yellow: "#e7c45f",
  gold: "#c8a34a",
  purple: "#8c74b6",
};

export const getColorSwatch = (color) => {
  if (!color) {
    return "#d7ccc1";
  }

  const normalized = color.trim().toLowerCase();

  if (swatchMap[normalized]) {
    return swatchMap[normalized];
  }

  if (normalized.startsWith("#")) {
    return normalized;
  }

  return "#d7ccc1";
};

const sizeRank = {
  XXS: 0,
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  XXXL: 7,
};

export const sortSizes = (sizes) => {
  return [...sizes].sort((first, second) => {
    const firstRank = sizeRank[first] ?? 99;
    const secondRank = sizeRank[second] ?? 99;

    if (firstRank === secondRank) {
      return first.localeCompare(second);
    }

    return firstRank - secondRank;
  });
};

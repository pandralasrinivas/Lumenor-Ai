const Coupon = require("../models/Coupon");

const getCartSubtotal = (items = []) =>
  items.reduce(
    (total, item) => total + Number(item.priceAtAddition || 0) * item.quantity,
    0,
  );

const getVariantSizeEntry = (product, selectedColor, selectedSize) => {
  if (!product?.variants?.length) {
    return { variant: null, sizeEntry: null };
  }

  const variant = product.variants.find((item) => item.color === selectedColor);
  const sizeEntry = variant?.sizes?.find((item) => item.size === selectedSize);

  return { variant, sizeEntry };
};

const validateVariantSelection = (product, selectedColor, selectedSize) => {
  if (!product?.variants?.length) {
    return;
  }

  if (!selectedColor || !selectedSize) {
    throw new Error("Please select size and color");
  }

  const { variant, sizeEntry } = getVariantSizeEntry(
    product,
    selectedColor,
    selectedSize,
  );

  if (!variant || !sizeEntry) {
    throw new Error("Selected variant is not available");
  }
};

const getAvailableStock = (product, selectedColor, selectedSize) => {
  if (!product?.variants?.length) {
    return Number.POSITIVE_INFINITY;
  }

  const { sizeEntry } = getVariantSizeEntry(product, selectedColor, selectedSize);

  return sizeEntry ? sizeEntry.stock : 0;
};

const calculateCouponDiscount = (coupon, subtotal) => {
  if (!coupon || subtotal <= 0) {
    return 0;
  }

  if (coupon.discountType === "percentage") {
    const percentageDiscount = (subtotal * coupon.discountValue) / 100;

    if (coupon.maxDiscount) {
      return Math.min(percentageDiscount, coupon.maxDiscount);
    }

    return percentageDiscount;
  }

  return coupon.discountValue;
};

const syncCartTotals = async (cart) => {
  cart.totalPrice = getCartSubtotal(cart.items);

  if (!cart.discountCode) {
    cart.discountAmount = 0;
    return cart;
  }

  const coupon = await Coupon.findOne({
    code: cart.discountCode,
    isActive: true,
    expiryDate: { $gt: new Date() },
  });

  if (!coupon || cart.totalPrice < coupon.minOrderValue) {
    cart.discountCode = null;
    cart.discountAmount = 0;
    return cart;
  }

  cart.discountAmount = calculateCouponDiscount(coupon, cart.totalPrice);
  return cart;
};

module.exports = {
  calculateCouponDiscount,
  getAvailableStock,
  getCartSubtotal,
  getVariantSizeEntry,
  syncCartTotals,
  validateVariantSelection,
};

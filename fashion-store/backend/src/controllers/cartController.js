const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Product = require("../models/Product");
const {
  calculateCouponDiscount,
  getAvailableStock,
  syncCartTotals,
  validateVariantSelection,
} = require("../utils/cart");

const getQuantityValue = (quantity) => Number(quantity);

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
    );

    if (!cart) {
      cart = new Cart({ user: req.user.id });
      await cart.save();
    }

    await syncCartTotals(cart);
    await cart.save();
    await cart.populate("items.product");

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity, selectedSize, selectedColor } = req.body;
    const quantityValue = getQuantityValue(quantity);

    if (!Number.isInteger(quantityValue) || quantityValue < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    validateVariantSelection(product, selectedColor, selectedSize);

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor,
    );

    const availableStock = getAvailableStock(product, selectedColor, selectedSize);
    const nextQuantity = existingItem
      ? existingItem.quantity + quantityValue
      : quantityValue;

    if (availableStock !== Number.POSITIVE_INFINITY && nextQuantity > availableStock) {
      return res.status(400).json({ message: "Requested quantity exceeds stock" });
    }

    if (existingItem) {
      existingItem.quantity = nextQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantityValue,
        selectedSize,
        selectedColor,
        priceAtAddition: product.discountPrice || product.price,
      });
    }

    await syncCartTotals(cart);
    await cart.save();
    await cart.populate("items.product");

    res.json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const quantityValue = getQuantityValue(quantity);

    if (!Number.isInteger(quantityValue) || quantityValue < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(item.product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    validateVariantSelection(product, item.selectedColor, item.selectedSize);

    const availableStock = getAvailableStock(
      product,
      item.selectedColor,
      item.selectedSize,
    );

    if (
      availableStock !== Number.POSITIVE_INFINITY &&
      quantityValue > availableStock
    ) {
      return res.status(400).json({ message: "Requested quantity exceeds stock" });
    }

    item.quantity = quantityValue;

    await syncCartTotals(cart);
    await cart.save();
    await cart.populate("items.product");

    res.json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items.pull(itemId);

    await syncCartTotals(cart);
    await cart.save();
    await cart.populate("items.product");

    res.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode?.trim()) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      expiryDate: { $gt: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon" });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (cart.totalPrice < coupon.minOrderValue) {
      return res.status(400).json({ message: "Minimum order value not met" });
    }

    cart.discountCode = couponCode.toUpperCase();
    cart.discountAmount = calculateCouponDiscount(coupon, cart.totalPrice);
    await cart.save();
    await cart.populate("items.product");

    res.json({
      success: true,
      message: "Coupon applied successfully",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], totalPrice: 0, discountAmount: 0, discountCode: null },
      { new: true },
    );

    res.json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  clearCart,
};

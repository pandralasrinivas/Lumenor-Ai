const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  clearCart,
} = require("../controllers/cartController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.put("/update", authMiddleware, updateCartItem);
router.delete("/remove/:itemId", authMiddleware, removeFromCart);
router.post("/coupon", authMiddleware, applyCoupon);
router.delete("/clear", authMiddleware, clearCart);

module.exports = router;

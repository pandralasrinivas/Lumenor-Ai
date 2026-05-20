const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  generateInvoice,
} = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);
router.get("/:id/invoice", authMiddleware, generateInvoice);

module.exports = router;

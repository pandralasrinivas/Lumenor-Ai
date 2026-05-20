const express = require("express");
const router = express.Router();
const {
  createAdminProduct,
  deleteAdminProduct,
  getAdminOrderById,
  getAdminOrders,
  getAdminOverview,
  getAdminProducts,
  getLowStockProducts,
  restoreAdminProduct,
  updateAdminOrderStatus,
  updateAdminProduct,
} = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.use(authMiddleware, adminMiddleware);

router.get("/overview", getAdminOverview);
router.get("/products", getAdminProducts);
router.get("/products/low-stock", getLowStockProducts);
router.post("/products", createAdminProduct);
router.put("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);
router.patch("/products/:id/restore", restoreAdminProduct);
router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrderById);
router.patch("/orders/:id/status", updateAdminOrderStatus);

module.exports = router;

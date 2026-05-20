const express = require("express");
const router = express.Router();
const {
  getRecommendationsByRecentlyViewed,
  getRecommendationsByPurchaseHistory,
  getPersonalizedRecommendations,
  addToRecentlyViewed,
} = require("../controllers/recommendationController");
const { authMiddleware } = require("../middleware/auth");

router.get(
  "/recently-viewed",
  authMiddleware,
  getRecommendationsByRecentlyViewed,
);
router.get(
  "/purchase-history",
  authMiddleware,
  getRecommendationsByPurchaseHistory,
);
router.get("/personalized", authMiddleware, getPersonalizedRecommendations);
router.post("/add-viewed", authMiddleware, addToRecentlyViewed);

module.exports = router;

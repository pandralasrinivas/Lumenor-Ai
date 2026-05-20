const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

const getTopSellingProducts = async (limit, excludedIds = [], categories = []) => {
  const query = {
    isActive: true,
    _id: { $nin: excludedIds },
  };

  if (categories.length) {
    query.category = { $in: categories };
  }

  return Product.find(query).sort({ totalSold: -1, rating: -1 }).limit(limit);
};

const getUniqueCategories = (products) => [
  ...new Set(products.map((product) => product.category).filter(Boolean)),
];

const getRecommendationsByRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.recentlyViewed.length === 0) {
      const topProducts = await getTopSellingProducts(8);

      return res.json({
        success: true,
        recommendations: topProducts,
        reason: "Top selling products",
      });
    }

    const viewedIds = user.recentlyViewed.map((item) => item.productId);
    const recentlyViewedProducts = await Product.find({
      _id: { $in: viewedIds },
      isActive: true,
    });
    const categories = getUniqueCategories(recentlyViewedProducts);

    const recommendations = await Product.find({
      category: { $in: categories },
      _id: { $nin: viewedIds },
      isActive: true,
    })
      .sort({ rating: -1, totalSold: -1 })
      .limit(8);

    res.json({
      success: true,
      recommendations,
      reason: "Based on recently viewed products",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecommendationsByPurchaseHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });

    if (orders.length === 0) {
      const topProducts = await getTopSellingProducts(8);

      return res.json({
        success: true,
        recommendations: topProducts,
        reason: "Top selling products",
      });
    }

    const purchasedProductIds = orders.flatMap((order) =>
      order.items.map((item) => item.product),
    );
    const purchasedProducts = await Product.find({
      _id: { $in: purchasedProductIds },
      isActive: true,
    });
    const categories = getUniqueCategories(purchasedProducts);

    const recommendations = await Product.find({
      category: { $in: categories },
      _id: { $nin: purchasedProductIds },
      isActive: true,
    })
      .sort({ rating: -1, totalSold: -1 })
      .limit(8);

    res.json({
      success: true,
      recommendations,
      reason: "Based on your purchase history",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { category, excludeProductId } = req.query;

    const [user, orders] = await Promise.all([
      User.findById(req.user.id),
      Order.find({ user: req.user.id }),
    ]);

    const viewedIds = user?.recentlyViewed?.map((item) => item.productId) || [];
    const purchasedIds = orders.flatMap((order) =>
      order.items.map((item) => item.product),
    );
    const excludedIds = [...viewedIds, ...purchasedIds];

    if (excludeProductId) {
      excludedIds.push(excludeProductId);
    }

    const relatedProducts = await Product.find({
      _id: { $in: [...viewedIds, ...purchasedIds] },
      isActive: true,
    });

    const preferredCategories = [
      ...(category ? [category] : []),
      ...getUniqueCategories(relatedProducts),
    ].filter(Boolean);

    const uniqueCategories = [...new Set(preferredCategories)];
    const personalized = await getTopSellingProducts(
      12,
      excludedIds,
      uniqueCategories,
    );

    if (personalized.length >= 12 || uniqueCategories.length === 0) {
      return res.json({
        success: true,
        recommendations: personalized,
        reason: uniqueCategories.length
          ? "Based on your shopping patterns"
          : "Top picks for you",
      });
    }

    const remaining = await getTopSellingProducts(
      12 - personalized.length,
      [...excludedIds, ...personalized.map((product) => product._id)],
    );

    res.json({
      success: true,
      recommendations: [...personalized, ...remaining],
      reason: "Based on your shopping patterns",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToRecentlyViewed = async (req, res) => {
  try {
    const { productId } = req.body;

    const [user, product] = await Promise.all([
      User.findById(req.user.id),
      Product.findById(productId),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingIndex = user.recentlyViewed.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (existingIndex > -1) {
      user.recentlyViewed.splice(existingIndex, 1);
    }

    user.recentlyViewed.unshift({
      productId,
      viewedAt: new Date(),
    });
    user.recentlyViewed = user.recentlyViewed.slice(0, 20);

    await user.save();

    res.json({
      success: true,
      message: "Product added to recently viewed",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecommendationsByRecentlyViewed,
  getRecommendationsByPurchaseHistory,
  getPersonalizedRecommendations,
  addToRecentlyViewed,
};

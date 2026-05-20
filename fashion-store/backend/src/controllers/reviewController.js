const Review = require("../models/Review");
const Product = require("../models/Product");

const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = new Review({
      product: productId,
      user: req.user.id,
      rating,
      title,
      comment,
      isVerified: true,
    });

    await review.save();
    const reviews = await Review.find({ product: productId });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    product.rating = avgRating;
    product.reviews.push(review._id);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "firstName lastName profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: review._id },
    });

    const remainingReviews = await Review.find({ product: review.product });
    const nextRating = remainingReviews.length
      ? remainingReviews.reduce((acc, item) => acc + item.rating, 0) /
        remainingReviews.length
      : 0;

    await Product.findByIdAndUpdate(review.product, {
      rating: nextRating,
    });

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  deleteReview,
};

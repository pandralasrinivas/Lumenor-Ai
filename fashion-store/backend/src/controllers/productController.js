const Product = require("../models/Product");

const parseCsvParam = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => parseCsvParam(item));
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getDisplayPrice = (product) => {
  return product.discountPrice || product.price || 0;
};

const getDiscountScore = (product) => {
  if (!product.discountPrice || !product.price) {
    return 0;
  }

  return ((product.price - product.discountPrice) / product.price) * 100;
};

const getProducts = async (req, res) => {
  try {
    const {
      category,
      categories,
      page = 1,
      limit = 12,
      search,
      sizes,
      colors,
      minRating,
      minPrice,
      maxPrice,
      sort = "popular",
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 12);
    const categoryFilters = parseCsvParam(categories || category);
    const sizeFilters = parseCsvParam(sizes);
    const colorFilters = parseCsvParam(colors);

    let query = { isActive: true };

    if (categoryFilters.length) {
      query.category = { $in: categoryFilters };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (sizeFilters.length) {
      query["variants.sizes.size"] = { $in: sizeFilters };
    }

    if (colorFilters.length) {
      query["variants.color"] = { $in: colorFilters };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) || 0 };
    }

    let products = await Product.find(query).exec();

    if (minPrice || maxPrice) {
      const minimumPrice = Number.isFinite(Number(minPrice))
        ? Number(minPrice)
        : 0;
      const maximumPrice = Number.isFinite(Number(maxPrice))
        ? Number(maxPrice)
        : Number.POSITIVE_INFINITY;

      products = products.filter((product) => {
        const displayPrice = getDisplayPrice(product);

        return displayPrice >= minimumPrice && displayPrice <= maximumPrice;
      });
    }

    products.sort((first, second) => {
      switch (sort) {
        case "newest":
          return new Date(second.createdAt) - new Date(first.createdAt);
        case "price-asc":
          return getDisplayPrice(first) - getDisplayPrice(second);
        case "price-desc":
          return getDisplayPrice(second) - getDisplayPrice(first);
        case "rating":
          return (second.rating || 0) - (first.rating || 0);
        case "discount":
          return getDiscountScore(second) - getDiscountScore(first);
        case "popular":
        default:
          return (second.totalSold || 0) - (first.totalSold || 0);
      }
    });

    const total = products.length;
    const skip = (pageNumber - 1) * limitNumber;
    const paginatedProducts = products.slice(skip, skip + limitNumber);
    const totalPages = Math.max(1, Math.ceil(total / limitNumber));

    res.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        total,
        pages: totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
};

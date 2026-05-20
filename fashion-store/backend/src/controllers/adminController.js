const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { sendEmail } = require("../config/email");

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 5);

const sendOptionalEmail = async (options) => {
  try {
    return await sendEmail(options);
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);
    return false;
  }
};

const getAdminOverview = async (req, res) => {
  try {
    const [productCount, activeProductCount, orderCount, userCount, orders] =
      await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Order.countDocuments(),
        User.countDocuments(),
        Order.find().select("status totalAmount"),
      ]);

    const pendingOrders = orders.filter((order) =>
      ["pending", "confirmed", "shipped"].includes(order.status),
    ).length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );

    const lowStockProducts = await Product.aggregate([
      { $unwind: "$variants" },
      { $unwind: "$variants.sizes" },
      {
        $match: {
          "variants.sizes.stock": { $lte: LOW_STOCK_THRESHOLD },
          isActive: true,
        },
      },
      { $count: "count" },
    ]);

    res.json({
      success: true,
      overview: {
        productCount,
        activeProductCount,
        orderCount,
        userCount,
        pendingOrders,
        totalRevenue,
        lowStockCount: lowStockProducts[0]?.count || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const {
      category,
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (typeof isActive !== "undefined") {
      query.isActive = isActive === "true";
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAdminProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discountPrice,
      images = [],
      variants = [],
      isActive = true,
    } = req.body;

    const product = new Product({
      name,
      description,
      category,
      price,
      discountPrice,
      images,
      variants,
      isActive,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAdminProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product archived successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restoreAdminProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product restored successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$variants" },
      { $unwind: "$variants.sizes" },
      {
        $match: {
          "variants.sizes.stock": { $lte: LOW_STOCK_THRESHOLD },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          color: "$variants.color",
          size: "$variants.sizes.size",
          stock: "$variants.sizes.stock",
        },
      },
      { $sort: { stock: 1, name: 1 } },
    ]);

    res.json({
      success: true,
      products,
      threshold: LOW_STOCK_THRESHOLD,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.orderNumber = { $regex: search, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "firstName lastName email")
        .populate("items.product")
        .populate("shippingAddress")
        .sort({ createdAt: sortDirection })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email phone")
      .populate("items.product")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAdminOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, estimatedDelivery, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id).populate(
      "user",
      "firstName email",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) {
      order.status = status;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    }

    if (status === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    if (order.user?.email && status) {
      const message =
        status === "shipped"
          ? `Your order is on the way.${order.trackingNumber ? ` Tracking number: <strong>${order.trackingNumber}</strong>.` : ""}`
          : `Your order status is now <strong>${status}</strong>.`;

      await sendOptionalEmail({
        email: order.user.email,
        subject: `Order Update - ${order.orderNumber}`,
        message: `
          <div style="font-family: Arial, sans-serif; color: #1f2937;">
            <h2>Hello ${order.user.firstName || "Customer"},</h2>
            <p>${message}</p>
            <p><strong>Order number:</strong> ${order.orderNumber}</p>
          </div>
        `,
      });
    }

    res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};

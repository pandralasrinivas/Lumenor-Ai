const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Address = require("../models/Address");
const User = require("../models/User");
const { sendEmail } = require("../config/email");
const {
  getAvailableStock,
  getVariantSizeEntry,
  syncCartTotals,
  validateVariantSelection,
} = require("../utils/cart");
const PDFDocument = require("pdfkit");

const SHIPPING_DELAY_MS = 24 * 60 * 60 * 1000;
const DELIVERY_DELAY_MS = 7 * 24 * 60 * 60 * 1000;
const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 5);
const FREE_SHIPPING_THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD || 99);
const STANDARD_SHIPPING_COST = Number(process.env.STANDARD_SHIPPING_COST || 5.99);
const EXPRESS_SHIPPING_COST = Number(process.env.EXPRESS_SHIPPING_COST || 12.99);
const CHECKOUT_TAX_RATE = Number(process.env.CHECKOUT_TAX_RATE || 0.0865);

const generateOrderNumber = () =>
  `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

const generateTrackingNumber = () =>
  `TRK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const formatCurrency = (value) => Number(value || 0).toFixed(2);

const formatFixedNumber = (value) => Number(Number(value || 0).toFixed(2));

const normalizePaymentMethod = (value) => {
  const allowedMethods = [
    "credit_debit_card",
    "paypal",
    "stripe",
    "cash_on_delivery",
    "dummy_payment",
  ];

  return allowedMethods.includes(value) ? value : "dummy_payment";
};

const normalizeShippingMethod = (value) => {
  return value === "express_shipping" ? "express_shipping" : "standard_shipping";
};

const calculateShippingCost = (shippingMethod, discountedSubtotal) => {
  if (shippingMethod === "express_shipping") {
    return EXPRESS_SHIPPING_COST;
  }

  return discountedSubtotal >= FREE_SHIPPING_THRESHOLD
    ? 0
    : STANDARD_SHIPPING_COST;
};

const buildOrderItemsMarkup = (items) =>
  items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0;">${item.product?.name || "Product"}</td>
          <td style="padding: 8px 0;">${item.selectedColor || "-"} / ${item.selectedSize || "-"}</td>
          <td style="padding: 8px 0;">${item.quantity}</td>
          <td style="padding: 8px 0;">$${formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `,
    )
    .join("");

const sendOptionalEmail = async (options) => {
  try {
    return await sendEmail(options);
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);
    return false;
  }
};

const sendOrderConfirmationEmail = async (user, order, shippingAddress) =>
  sendOptionalEmail({
    email: user.email,
    subject: `Order Confirmed - ${order.orderNumber}`,
    message: `
      <div style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2>Thanks for your order, ${user.firstName}!</h2>
        <p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
        <p>Estimated delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="text-align: left; border-bottom: 1px solid #d1d5db;">
              <th>Item</th>
              <th>Variant</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${buildOrderItemsMarkup(order.items)}</tbody>
        </table>
        <p><strong>Total:</strong> $${formatCurrency(order.totalAmount)}</p>
        <p><strong>Shipping:</strong> $${formatCurrency(order.shippingCost)}</p>
        <p><strong>Estimated tax:</strong> $${formatCurrency(order.taxAmount)}</p>
        <p><strong>Ship to:</strong> ${shippingAddress.fullName}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}, ${shippingAddress.country}</p>
      </div>
    `,
  });

const sendOrderStatusEmail = async (user, order) => {
  const statusMessage =
    order.status === "shipped"
      ? `Your order is on the way with tracking number <strong>${order.trackingNumber}</strong>.`
      : "Your order has been delivered.";

  return sendOptionalEmail({
    email: user.email,
    subject: `Order Update - ${order.orderNumber}`,
    message: `
      <div style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2>Order ${order.status}</h2>
        <p>${statusMessage}</p>
        <p><strong>Order number:</strong> ${order.orderNumber}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>
    `,
  });
};

const sendLowStockAlertEmail = async (alerts) => {
  const inventoryEmail = process.env.INVENTORY_ALERT_EMAIL || process.env.SMTP_USER;

  if (!inventoryEmail || !alerts.length) {
    return false;
  }

  const listMarkup = alerts
    .map(
      (alert) => `
        <li>
          ${alert.name} - ${alert.color} / ${alert.size}: ${alert.stock} left
        </li>
      `,
    )
    .join("");

  return sendOptionalEmail({
    email: inventoryEmail,
    subject: "Low Stock Alert",
    message: `
      <div style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2>Low stock items</h2>
        <ul>${listMarkup}</ul>
      </div>
    `,
  });
};

const syncOrderLifecycle = async (order, user) => {
  const now = new Date();
  const shippingDate = new Date(order.createdAt.getTime() + SHIPPING_DELAY_MS);
  let shouldSave = false;

  if (
    order.status === "confirmed" &&
    now >= shippingDate &&
    now < order.estimatedDelivery
  ) {
    order.status = "shipped";
    order.shippedAt = order.shippedAt || shippingDate;
    order.trackingNumber = order.trackingNumber || generateTrackingNumber();
    shouldSave = true;
  }

  if (
    ["confirmed", "shipped"].includes(order.status) &&
    order.estimatedDelivery &&
    now >= order.estimatedDelivery
  ) {
    order.status = "delivered";
    order.shippedAt = order.shippedAt || shippingDate;
    order.trackingNumber = order.trackingNumber || generateTrackingNumber();
    order.deliveredAt = order.deliveredAt || order.estimatedDelivery;
    shouldSave = true;
  }

  if (
    user?.email &&
    ["shipped", "delivered"].includes(order.status) &&
    order.lastStatusEmailSent !== order.status
  ) {
    const emailSent = await sendOrderStatusEmail(user, order);

    if (emailSent) {
      order.lastStatusEmailSent = order.status;
      shouldSave = true;
    }
  }

  if (shouldSave) {
    await order.save();
  }

  return order;
};

const buildInvoiceBuffer = (order) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(24).text("Invoice");
    doc.moveDown();
    doc.fontSize(12).text(`Order Number: ${order.orderNumber}`);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Customer: ${order.user.firstName} ${order.user.lastName}`);
    doc.text(`Email: ${order.user.email}`);
    doc.moveDown();
    doc.fontSize(14).text("Items");
    doc.moveDown(0.5);

    order.items.forEach((item) => {
      doc
        .fontSize(12)
        .text(
          `${item.product?.name || "Product"} (${item.selectedColor || "-"}, ${item.selectedSize || "-"}) x ${item.quantity} = $${formatCurrency(item.price * item.quantity)}`,
        );
    });

    doc.moveDown();
    doc.text(`Subtotal: $${formatCurrency(order.subtotalAmount)}`);
    doc.text(`Discount: -$${formatCurrency(order.discountAmount)}`);
    doc.text(`Shipping: $${formatCurrency(order.shippingCost)}`);
    doc.text(`Estimated tax: $${formatCurrency(order.taxAmount)}`);
    doc.text(`Total: $${formatCurrency(order.totalAmount)}`);

    if (order.shippingAddress) {
      doc.moveDown();
      doc.fontSize(14).text("Shipping Address");
      doc.fontSize(12).text(order.shippingAddress.fullName);
      doc.text(order.shippingAddress.street);
      doc.text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
      );
      doc.text(order.shippingAddress.country);
      doc.text(order.shippingAddress.phone);
    }

    doc.end();
  });

const createOrder = async (req, res) => {
  try {
    const {
      shippingAddressId,
      paymentMethod = "dummy_payment",
      shippingMethod = "standard_shipping",
    } = req.body;

    const [cart, user, shippingAddress] = await Promise.all([
      Cart.findOne({ user: req.user.id }).populate("items.product"),
      User.findById(req.user.id),
      Address.findOne({ _id: shippingAddressId, user: req.user.id }),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!shippingAddress) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    await syncCartTotals(cart);
    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    const normalizedShippingMethod = normalizeShippingMethod(shippingMethod);
    const subtotalAmount = formatFixedNumber(cart.totalPrice);
    const discountAmount = formatFixedNumber(cart.discountAmount);
    const discountedSubtotal = Math.max(subtotalAmount - discountAmount, 0);
    const shippingCost = formatFixedNumber(
      calculateShippingCost(normalizedShippingMethod, discountedSubtotal),
    );
    const taxAmount = formatFixedNumber(
      (discountedSubtotal + shippingCost) * CHECKOUT_TAX_RATE,
    );
    const totalAmount = formatFixedNumber(
      discountedSubtotal + shippingCost + taxAmount,
    );

    const lowStockAlerts = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(404).json({ message: "A product in your cart was not found" });
      }

      validateVariantSelection(product, item.selectedColor, item.selectedSize);

      const availableStock = getAvailableStock(
        product,
        item.selectedColor,
        item.selectedSize,
      );

      if (
        availableStock !== Number.POSITIVE_INFINITY &&
        item.quantity > availableStock
      ) {
        return res.status(400).json({
          message: `${product.name} does not have enough stock for the selected variant`,
        });
      }
    }

    const order = new Order({
      user: req.user.id,
      orderNumber: generateOrderNumber(),
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        price: item.priceAtAddition,
      })),
      subtotalAmount,
      totalAmount,
      discountAmount,
      discountCode: cart.discountCode,
      shippingMethod: normalizedShippingMethod,
      shippingCost,
      taxAmount,
      shippingAddress: shippingAddressId,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: "completed",
      status: "confirmed",
      estimatedDelivery: new Date(Date.now() + DELIVERY_DELAY_MS),
    });

    for (const item of cart.items) {
      const product = item.product;

      if (product.variants?.length) {
        const { sizeEntry } = getVariantSizeEntry(
          product,
          item.selectedColor,
          item.selectedSize,
        );

        if (sizeEntry) {
          const stockBefore = sizeEntry.stock;
          sizeEntry.stock -= item.quantity;

          if (
            stockBefore > LOW_STOCK_THRESHOLD &&
            sizeEntry.stock <= LOW_STOCK_THRESHOLD
          ) {
            lowStockAlerts.push({
              name: product.name,
              color: item.selectedColor || "-",
              size: item.selectedSize || "-",
              stock: sizeEntry.stock,
            });
          }
        }
      }

      product.totalSold += item.quantity;
      await product.save();
    }

    await order.save();

    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], totalPrice: 0, discountAmount: 0, discountCode: null },
    );

    await Promise.all([
      sendOrderConfirmationEmail(user, order, shippingAddress),
      sendLowStockAlertEmail(lowStockAlerts),
    ]);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const [orders, user] = await Promise.all([
      Order.find({ user: req.user.id })
        .populate("items.product")
        .populate("shippingAddress")
        .sort({ createdAt: -1 }),
      User.findById(req.user.id),
    ]);

    const syncedOrders = await Promise.all(
      orders.map((order) => syncOrderLifecycle(order, user)),
    );

    res.json({
      success: true,
      orders: syncedOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const [order, user] = await Promise.all([
      Order.findById(req.params.id)
        .populate("items.product")
        .populate("shippingAddress"),
      User.findById(req.user.id),
    ]);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await syncOrderLifecycle(order, user);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("user")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await syncOrderLifecycle(order, order.user);

    const pdfBuffer = await buildInvoiceBuffer(order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  generateInvoice,
};

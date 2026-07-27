import {
  demoAddresses,
  demoAdmin,
  demoCustomer,
  staticProducts,
} from "../data/staticStore";

const PRODUCTS_KEY = "styleup.static.products";
const PRODUCTS_VERSION_KEY = "styleup.static.products.version";
const PRODUCTS_VERSION = "2026-07-static-catalog-v1";
const USER_KEY = "styleup.static.user";
const CART_KEY = "styleup.static.cart";
const COUPON_KEY = "styleup.static.coupon";
const ADDRESSES_KEY = "styleup.static.addresses";
const ORDERS_KEY = "styleup.static.orders";
const REVIEWS_KEY = "styleup.static.reviews";

const clone = (value) => JSON.parse(JSON.stringify(value));

const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readJSON = (key, fallback) => {
  if (!hasStorage()) {
    return clone(fallback);
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : clone(fallback);
  } catch {
    return clone(fallback);
  }
};

const writeJSON = (key, value) => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const getToken = () => {
  if (!hasStorage()) {
    return null;
  }

  return window.localStorage.getItem("token");
};

const response = (data) => Promise.resolve({ data });

const rejectWithMessage = (message, status = 400) =>
  Promise.reject({
    response: {
      status,
      data: { message },
    },
  });

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const safePart = (value) =>
  String(value || "default")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getDisplayPrice = (product) =>
  Number(product?.discountPrice || product?.price || 0);

const getDiscountPercent = (product) => {
  const price = Number(product?.price || 0);
  const discountPrice = Number(product?.discountPrice || 0);

  if (!price || !discountPrice || discountPrice >= price) {
    return 0;
  }

  return Math.round(((price - discountPrice) / price) * 100);
};

const seedProducts = () => {
  writeJSON(PRODUCTS_KEY, staticProducts);
  writeJSON(PRODUCTS_VERSION_KEY, PRODUCTS_VERSION);
  return clone(staticProducts);
};

const readProducts = () => {
  if (!hasStorage()) {
    return clone(staticProducts);
  }

  const storedVersion = window.localStorage.getItem(PRODUCTS_VERSION_KEY);
  const storedProducts = readJSON(PRODUCTS_KEY, null);

  if (storedVersion !== PRODUCTS_VERSION || !Array.isArray(storedProducts)) {
    return seedProducts();
  }

  return storedProducts;
};

const writeProducts = (products) => {
  writeJSON(PRODUCTS_KEY, products);
  writeJSON(PRODUCTS_VERSION_KEY, PRODUCTS_VERSION);
};

const getProductColors = (product) =>
  [...new Set((product?.variants || []).map((variant) => variant.color))]
    .filter(Boolean);

const getProductSizes = (product) =>
  [
    ...new Set(
      (product?.variants || []).flatMap((variant) =>
        (variant.sizes || []).map((size) => size.size),
      ),
    ),
  ].filter(Boolean);

const parseList = (value) => {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const sortProducts = (products, sort = "popular") => {
  const nextProducts = [...products];

  switch (sort) {
    case "newest":
      return nextProducts.sort(
        (first, second) =>
          new Date(second.createdAt || 0) - new Date(first.createdAt || 0),
      );
    case "price-asc":
      return nextProducts.sort(
        (first, second) => getDisplayPrice(first) - getDisplayPrice(second),
      );
    case "price-desc":
      return nextProducts.sort(
        (first, second) => getDisplayPrice(second) - getDisplayPrice(first),
      );
    case "rating":
      return nextProducts.sort(
        (first, second) => Number(second.rating || 0) - Number(first.rating || 0),
      );
    case "discount":
      return nextProducts.sort(
        (first, second) => getDiscountPercent(second) - getDiscountPercent(first),
      );
    case "popular":
    default:
      return nextProducts.sort((first, second) => {
        const firstScore =
          Number(first.rating || 0) * 10 + Number(first.reviews?.length || 0);
        const secondScore =
          Number(second.rating || 0) * 10 + Number(second.reviews?.length || 0);
        return secondScore - firstScore;
      });
  }
};

const queryProducts = (params = {}, includeArchived = false) => {
  const search = String(params.search || "").trim().toLowerCase();
  const categories = parseList(params.categories || params.category);
  const sizes = parseList(params.sizes);
  const colors = parseList(params.colors);
  const minPrice =
    params.minPrice === undefined || params.minPrice === ""
      ? null
      : Number(params.minPrice);
  const maxPrice =
    params.maxPrice === undefined || params.maxPrice === ""
      ? null
      : Number(params.maxPrice);
  const minRating = Number(params.minRating || 0);

  let products = readProducts();

  if (!includeArchived) {
    products = products.filter((product) => product.isActive !== false);
  }

  if (typeof params.isActive === "boolean") {
    products = products.filter((product) => product.isActive === params.isActive);
  }

  if (search) {
    products = products.filter((product) => {
      const haystack = `${product.name} ${product.description} ${product.category}`
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (categories.length) {
    products = products.filter((product) => categories.includes(product.category));
  }

  if (sizes.length) {
    products = products.filter((product) =>
      getProductSizes(product).some((size) => sizes.includes(size)),
    );
  }

  if (colors.length) {
    products = products.filter((product) =>
      getProductColors(product).some((color) => colors.includes(color)),
    );
  }

  if (Number.isFinite(minPrice)) {
    products = products.filter((product) => getDisplayPrice(product) >= minPrice);
  }

  if (Number.isFinite(maxPrice)) {
    products = products.filter((product) => getDisplayPrice(product) <= maxPrice);
  }

  if (minRating > 0) {
    products = products.filter((product) => Number(product.rating || 0) >= minRating);
  }

  return sortProducts(products, params.sort);
};

const paginate = (products, params = {}) => {
  const page = Math.max(1, Number(params.page || 1));
  const limit = Math.max(1, Number(params.limit || 12));
  const total = products.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * limit;

  return {
    products: products.slice(start, start + limit),
    pagination: {
      total,
      pages,
      currentPage,
      limit,
    },
  };
};

const currentUserFromStorage = () => readJSON(USER_KEY, null);

const getCurrentUser = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  const storedUser = currentUserFromStorage();

  if (storedUser) {
    return storedUser;
  }

  return token.includes("admin") ? clone(demoAdmin) : clone(demoCustomer);
};

const persistUser = (user) => {
  writeJSON(USER_KEY, user);
};

const readAddresses = () => {
  const addresses = readJSON(ADDRESSES_KEY, null);

  if (Array.isArray(addresses)) {
    return addresses;
  }

  writeJSON(ADDRESSES_KEY, demoAddresses);
  return clone(demoAddresses);
};

const writeAddresses = (addresses) => {
  writeJSON(ADDRESSES_KEY, addresses);
};

const readCartEntries = () => {
  const entries = readJSON(CART_KEY, []);
  return Array.isArray(entries) ? entries : [];
};

const writeCartEntries = (entries) => {
  writeJSON(CART_KEY, entries);
};

const getCouponRate = (couponCode) => {
  const normalizedCode = String(couponCode || "").trim().toUpperCase();
  const coupons = {
    WELCOME20: 0.2,
    STYLE10: 0.1,
    STATIC15: 0.15,
  };

  return coupons[normalizedCode] || 0;
};

const buildCart = () => {
  const products = readProducts();
  const entries = readCartEntries();
  const hydratedItems = entries
    .map((entry) => {
      const product = products.find((item) => item._id === entry.productId);

      if (!product) {
        return null;
      }

      return {
        _id: entry._id,
        product,
        quantity: Number(entry.quantity || 1),
        selectedColor: entry.selectedColor || "",
        selectedSize: entry.selectedSize || "",
        priceAtAddition: Number(entry.priceAtAddition || getDisplayPrice(product)),
      };
    })
    .filter(Boolean);
  const totalPrice = Number(
    hydratedItems
      .reduce(
        (total, item) =>
          total + Number(item.priceAtAddition || 0) * Number(item.quantity || 1),
        0,
      )
      .toFixed(2),
  );
  const discountCode = readJSON(COUPON_KEY, null);
  const couponRate = getCouponRate(discountCode);
  const discountAmount = Number((totalPrice * couponRate).toFixed(2));

  return {
    items: hydratedItems,
    totalPrice,
    discountAmount,
    discountCode: couponRate ? String(discountCode).toUpperCase() : null,
  };
};

const getFirstAvailableSelection = (product) => {
  const variant =
    product.variants?.find((item) =>
      item.sizes?.some((size) => Number(size.stock || 0) > 0),
    ) || product.variants?.[0];
  const size =
    variant?.sizes?.find((item) => Number(item.stock || 0) > 0) ||
    variant?.sizes?.[0];

  return {
    selectedColor: variant?.color || "",
    selectedSize: size?.size || "",
  };
};

const getOrderSeed = () => {
  const products = readProducts();
  const product = products[0];
  const address = readAddresses()[0];
  const price = getDisplayPrice(product);
  const subtotalAmount = Number((price * 1).toFixed(2));
  const discountAmount = Number((subtotalAmount * 0.2).toFixed(2));
  const shippingCost = subtotalAmount - discountAmount >= 99 ? 0 : 5.99;
  const taxAmount = Number(
    ((subtotalAmount - discountAmount + shippingCost) * 0.0865).toFixed(2),
  );
  const totalAmount = Number(
    (subtotalAmount - discountAmount + shippingCost + taxAmount).toFixed(2),
  );
  const selection = getFirstAvailableSelection(product);

  return [
    {
      _id: "order-demo-1001",
      orderNumber: "ST-1001",
      user: demoCustomer,
      items: [
        {
          product,
          quantity: 1,
          selectedColor: selection.selectedColor,
          selectedSize: selection.selectedSize,
          price,
        },
      ],
      shippingAddress: address,
      paymentMethod: "credit_debit_card",
      shippingMethod: "standard_shipping",
      status: "shipped",
      paymentStatus: "completed",
      subtotalAmount,
      discountAmount,
      shippingCost,
      taxAmount,
      totalAmount,
      trackingNumber: "STUP-STATIC-1001",
      estimatedDelivery: "2026-08-01T10:00:00.000Z",
      createdAt: "2026-07-20T13:20:00.000Z",
    },
  ];
};

const readOrders = () => {
  const orders = readJSON(ORDERS_KEY, null);

  if (Array.isArray(orders)) {
    return orders;
  }

  const seedOrders = getOrderSeed();
  writeJSON(ORDERS_KEY, seedOrders);
  return seedOrders;
};

const writeOrders = (orders) => {
  writeJSON(ORDERS_KEY, orders);
};

const getReviewsForProduct = (productId) => {
  const product = readProducts().find((item) => item._id === productId);
  const localReviewsByProduct = readJSON(REVIEWS_KEY, {});
  const localReviews = Array.isArray(localReviewsByProduct[productId])
    ? localReviewsByProduct[productId]
    : [];

  return [...(product?.reviews || []), ...localReviews].sort(
    (first, second) =>
      new Date(second.createdAt || 0) - new Date(first.createdAt || 0),
  );
};

export const downloadBlobFile = (blob, filename) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const authAPI = {
  register: (data) => {
    const user = {
      ...demoCustomer,
      _id: makeId("user"),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || "",
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    persistUser(user);
    return response({ user, token: `static-customer-${Date.now()}` });
  },

  login: ({ email }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return rejectWithMessage("Please enter an email address");
    }

    const isAdmin = normalizedEmail.includes("admin");
    const user = isAdmin
      ? { ...demoAdmin, email: normalizedEmail }
      : { ...demoCustomer, email: normalizedEmail };

    persistUser(user);
    return response({
      user,
      token: `static-${user.role}-${Date.now()}`,
    });
  },

  getProfile: () => {
    const user = getCurrentUser();

    if (!user) {
      return rejectWithMessage("Please log in again", 401);
    }

    return response({ user });
  },

  updateProfile: (data) => {
    const user = getCurrentUser();

    if (!user) {
      return rejectWithMessage("Please log in again", 401);
    }

    const nextUser = {
      ...user,
      ...data,
    };

    persistUser(nextUser);
    return response({ user: nextUser });
  },
};

export const productAPI = {
  getAll: (params = {}) => {
    const products = queryProducts(params, false);
    const result = paginate(products, params);
    return response(result);
  },

  getById: (id) => {
    const product = readProducts().find(
      (item) => item._id === id && item.isActive !== false,
    );

    if (!product) {
      return rejectWithMessage("Product not found", 404);
    }

    return response({ product });
  },
};

export const cartAPI = {
  get: () => response({ cart: buildCart() }),

  add: ({ productId, quantity = 1, selectedSize, selectedColor }) => {
    const product = readProducts().find(
      (item) => item._id === productId && item.isActive !== false,
    );

    if (!product) {
      return rejectWithMessage("Product not found", 404);
    }

    const fallbackSelection = getFirstAvailableSelection(product);
    const nextColor = selectedColor || fallbackSelection.selectedColor;
    const nextSize = selectedSize || fallbackSelection.selectedSize;
    const itemId = `cart-${safePart(product._id)}-${safePart(nextColor)}-${safePart(
      nextSize,
    )}`;
    const entries = readCartEntries();
    const existingEntry = entries.find((entry) => entry._id === itemId);

    if (existingEntry) {
      existingEntry.quantity += Number(quantity || 1);
    } else {
      entries.push({
        _id: itemId,
        productId: product._id,
        quantity: Number(quantity || 1),
        selectedColor: nextColor,
        selectedSize: nextSize,
        priceAtAddition: getDisplayPrice(product),
      });
    }

    writeCartEntries(entries);
    return response({ cart: buildCart() });
  },

  update: ({ itemId, quantity }) => {
    const entries = readCartEntries().map((entry) =>
      entry._id === itemId
        ? { ...entry, quantity: Math.max(1, Number(quantity || 1)) }
        : entry,
    );

    writeCartEntries(entries);
    return response({ cart: buildCart() });
  },

  remove: (itemId) => {
    writeCartEntries(readCartEntries().filter((entry) => entry._id !== itemId));
    return response({ cart: buildCart() });
  },

  applyCoupon: ({ couponCode }) => {
    const normalizedCode = String(couponCode || "").trim().toUpperCase();

    if (!getCouponRate(normalizedCode)) {
      return rejectWithMessage("Use WELCOME20, STYLE10, or STATIC15 for this static demo");
    }

    writeJSON(COUPON_KEY, normalizedCode);
    return response({ cart: buildCart() });
  },

  clear: () => {
    writeCartEntries([]);
    writeJSON(COUPON_KEY, null);
    return response({
      cart: {
        items: [],
        totalPrice: 0,
        discountAmount: 0,
        discountCode: null,
      },
    });
  },
};

export const orderAPI = {
  create: ({ shippingAddressId, paymentMethod, shippingMethod }) => {
    const user = getCurrentUser() || demoCustomer;
    const cart = buildCart();

    if (!cart.items.length) {
      return rejectWithMessage("Your cart is empty");
    }

    const addresses = readAddresses();
    const address =
      addresses.find((item) => item._id === shippingAddressId) || addresses[0];

    if (!address) {
      return rejectWithMessage("Please add a shipping address");
    }

    const discountedSubtotal = Math.max(cart.totalPrice - cart.discountAmount, 0);
    const shippingCost =
      shippingMethod === "express_shipping"
        ? 12.99
        : discountedSubtotal >= 99
          ? 0
          : 5.99;
    const taxAmount = Number(((discountedSubtotal + shippingCost) * 0.0865).toFixed(2));
    const totalAmount = Number((discountedSubtotal + shippingCost + taxAmount).toFixed(2));
    const orderId = makeId("order");
    const order = {
      _id: orderId,
      orderNumber: `ST-${String(Date.now()).slice(-6)}`,
      user,
      items: cart.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        price: item.priceAtAddition,
      })),
      shippingAddress: address,
      paymentMethod,
      shippingMethod,
      status: "confirmed",
      paymentStatus: "completed",
      subtotalAmount: cart.totalPrice,
      discountAmount: cart.discountAmount,
      shippingCost,
      taxAmount,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    writeOrders([order, ...readOrders()]);
    writeCartEntries([]);
    writeJSON(COUPON_KEY, null);
    return response({ order });
  },

  getAll: () => {
    const user = getCurrentUser();
    const orders = readOrders().filter((order) => {
      if (!user || user.role === "admin") {
        return true;
      }

      return order.user?._id === user._id || order.user?.email === user.email;
    });

    return response({ orders });
  },

  getById: (id) => {
    const order = readOrders().find((item) => item._id === id);

    if (!order) {
      return rejectWithMessage("Order not found", 404);
    }

    return response({ order });
  },

  generateInvoice: (id) => {
    const order = readOrders().find((item) => item._id === id);

    if (!order) {
      return rejectWithMessage("Order not found", 404);
    }

    const invoiceText = [
      `Invoice ${order.orderNumber}`,
      `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      `Customer: ${order.user?.firstName || ""} ${order.user?.lastName || ""}`,
      "",
      ...order.items.map(
        (item) =>
          `${item.product?.name || "Product"} x ${item.quantity} - $${Number(
            item.price * item.quantity,
          ).toFixed(2)}`,
      ),
      "",
      `Total: $${Number(order.totalAmount || 0).toFixed(2)}`,
    ].join("\n");
    const blob = new Blob([invoiceText], { type: "application/pdf" });

    return response(blob);
  },
};

export const addressAPI = {
  getAll: () => response({ addresses: readAddresses() }),

  create: (data) => {
    const addresses = readAddresses();
    const address = {
      ...data,
      _id: makeId("address"),
      isDefault: Boolean(data.isDefault || addresses.length === 0),
    };
    const nextAddresses = address.isDefault
      ? addresses.map((item) => ({ ...item, isDefault: false }))
      : addresses;

    writeAddresses([...nextAddresses, address]);
    return response({ address });
  },

  update: (id, data) => {
    const addresses = readAddresses();
    const address = {
      ...addresses.find((item) => item._id === id),
      ...data,
      _id: id,
    };
    const nextAddresses = addresses.map((item) => {
      if (item._id === id) {
        return address;
      }

      return data.isDefault ? { ...item, isDefault: false } : item;
    });

    writeAddresses(nextAddresses);
    return response({ address });
  },

  delete: (id) => {
    writeAddresses(readAddresses().filter((item) => item._id !== id));
    return response({ success: true });
  },
};

export const recommendationAPI = {
  getByRecentlyViewed: () =>
    response({ recommendations: queryProducts({ sort: "newest", limit: 8 }) }),

  getByPurchaseHistory: () =>
    response({ recommendations: queryProducts({ sort: "popular", limit: 8 }) }),

  getPersonalized: (params = {}) => {
    const products = queryProducts(
      {
        category: params.category,
        sort: "popular",
        limit: 8,
      },
      false,
    ).filter((product) => product._id !== params.excludeProductId);

    return response({ recommendations: products.slice(0, 8) });
  },

  addViewed: () => response({ success: true }),
};

export const adminAPI = {
  getOverview: () => {
    const products = readProducts();
    const orders = readOrders();

    return response({
      overview: {
        productCount: products.length,
        orderCount: orders.length,
        userCount: 24 + orders.length,
        totalRevenue: orders.reduce(
          (total, order) => total + Number(order.totalAmount || 0),
          0,
        ),
      },
    });
  },

  getProducts: (params = {}) => {
    const products = queryProducts(params, true);
    const result = paginate(products, {
      page: params.page || 1,
      limit: params.limit || 50,
    });

    return response(result);
  },

  getLowStockProducts: () => {
    const products = readProducts();
    const lowStockProducts = products.flatMap((product) =>
      (product.variants || []).flatMap((variant) =>
        (variant.sizes || [])
          .filter((size) => Number(size.stock || 0) <= 5)
          .map((size) => ({
            _id: product._id,
            name: product.name,
            category: product.category,
            color: variant.color,
            size: size.size,
            stock: Number(size.stock || 0),
          })),
      ),
    );

    return response({ products: lowStockProducts });
  },

  createProduct: (data) => {
    const products = readProducts();
    const product = {
      ...data,
      _id: makeId("prod"),
      rating: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
      isActive: data.isActive !== false,
    };

    writeProducts([product, ...products]);
    return response({ product });
  },

  updateProduct: (id, data) => {
    const products = readProducts();
    const existingProduct = products.find((product) => product._id === id);

    if (!existingProduct) {
      return rejectWithMessage("Product not found", 404);
    }

    const product = {
      ...existingProduct,
      ...data,
      _id: id,
    };

    writeProducts(products.map((item) => (item._id === id ? product : item)));
    return response({ product });
  },

  archiveProduct: (id) => {
    const products = readProducts();
    writeProducts(
      products.map((product) =>
        product._id === id ? { ...product, isActive: false } : product,
      ),
    );
    return response({ success: true });
  },

  restoreProduct: (id) => {
    const products = readProducts();
    writeProducts(
      products.map((product) =>
        product._id === id ? { ...product, isActive: true } : product,
      ),
    );
    return response({ success: true });
  },

  getOrders: (params = {}) => {
    const search = String(params.search || "").trim().toLowerCase();
    let orders = readOrders();

    if (search) {
      orders = orders.filter((order) =>
        String(order.orderNumber || "").toLowerCase().includes(search),
      );
    }

    if (params.status && params.status !== "all") {
      orders = orders.filter((order) => order.status === params.status);
    }

    if (params.paymentStatus && params.paymentStatus !== "all") {
      orders = orders.filter(
        (order) => order.paymentStatus === params.paymentStatus,
      );
    }

    orders = orders.sort(
      (first, second) =>
        new Date(second.createdAt || 0) - new Date(first.createdAt || 0),
    );

    return response({
      orders: orders.slice(0, Number(params.limit || 50)),
      pagination: {
        total: orders.length,
        pages: 1,
        currentPage: 1,
        limit: Number(params.limit || 50),
      },
    });
  },

  getOrderById: (id) => {
    const order = readOrders().find((item) => item._id === id);

    if (!order) {
      return rejectWithMessage("Order not found", 404);
    }

    return response({ order });
  },

  updateOrderStatus: (id, data) => {
    const orders = readOrders();
    const order = orders.find((item) => item._id === id);

    if (!order) {
      return rejectWithMessage("Order not found", 404);
    }

    const nextOrder = {
      ...order,
      ...data,
      shippedAt:
        data.status === "shipped" || data.status === "delivered"
          ? order.shippedAt || new Date().toISOString()
          : order.shippedAt,
      deliveredAt:
        data.status === "delivered"
          ? order.deliveredAt || new Date().toISOString()
          : order.deliveredAt,
    };

    writeOrders(orders.map((item) => (item._id === id ? nextOrder : item)));
    return response({ order: nextOrder });
  },
};

export const reviewAPI = {
  create: ({ productId, rating, title, comment }) => {
    const user = getCurrentUser() || demoCustomer;
    const reviewsByProduct = readJSON(REVIEWS_KEY, {});
    const review = {
      _id: makeId("review"),
      productId,
      rating: Number(rating || 5),
      title,
      comment,
      user,
      createdAt: new Date().toISOString(),
    };

    reviewsByProduct[productId] = [
      review,
      ...(Array.isArray(reviewsByProduct[productId])
        ? reviewsByProduct[productId]
        : []),
    ];
    writeJSON(REVIEWS_KEY, reviewsByProduct);
    return response({ review });
  },

  getByProduct: (productId) =>
    response({ reviews: getReviewsForProduct(productId) }),

  delete: (id) => {
    const reviewsByProduct = readJSON(REVIEWS_KEY, {});

    Object.keys(reviewsByProduct).forEach((productId) => {
      reviewsByProduct[productId] = reviewsByProduct[productId].filter(
        (review) => review._id !== id,
      );
    });

    writeJSON(REVIEWS_KEY, reviewsByProduct);
    return response({ success: true });
  },
};

const api = {
  get: (path) =>
    path === "/health"
      ? response({ status: "ok", mode: "static" })
      : rejectWithMessage(`Static route not implemented: ${path}`, 404),
  post: (path) => rejectWithMessage(`Static route not implemented: ${path}`, 404),
  put: (path) => rejectWithMessage(`Static route not implemented: ${path}`, 404),
  patch: (path) => rejectWithMessage(`Static route not implemented: ${path}`, 404),
  delete: (path) =>
    rejectWithMessage(`Static route not implemented: ${path}`, 404),
};

export default api;

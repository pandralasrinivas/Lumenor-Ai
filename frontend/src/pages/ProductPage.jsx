import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Headphones,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import {
  cartAPI,
  productAPI,
  recommendationAPI,
  reviewAPI,
} from "../utils/api";
import { setCurrentProduct } from "../redux/productSlice";
import { setCart } from "../redux/cartSlice";
import {
  getColorSwatch,
  getDiscountPercent,
  getDisplayPrice,
  formatINR,
  getProductColors,
  getProductSizes,
  sortSizes,
} from "../utils/productPresentation";

const sectionShell = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8";

const perks = [
  {
    icon: Truck,
    title: "Free Shipping",
    copy: "On orders over ₹999",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    copy: "30 days return",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    copy: "100% secure",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    copy: "We're here to help",
  },
];

const getVariantStock = (product, selectedColor, selectedSize) => {
  if (!product?.variants?.length) {
    return Number.POSITIVE_INFINITY;
  }

  const variant = product.variants.find((item) => item.color === selectedColor);
  const sizeEntry = variant?.sizes?.find((item) => item.size === selectedSize);

  return sizeEntry ? sizeEntry.stock : 0;
};

const getInitialSelection = (product) => {
  const firstAvailableVariant =
    product?.variants?.find((variant) =>
      variant.sizes?.some((size) => size.stock > 0),
    ) || product?.variants?.[0];
  const firstAvailableSize =
    firstAvailableVariant?.sizes?.find((size) => size.stock > 0) ||
    firstAvailableVariant?.sizes?.[0];

  return {
    color: firstAvailableVariant?.color || "",
    size: firstAvailableSize?.size || "",
  };
};

const renderStarRow = (value, size = 16) => {
  const roundedRating = Math.max(0, Math.min(5, Math.round(value || 0)));

  return Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={`${size}-${index}`}
      size={size}
      fill={index < roundedRating ? "currentColor" : "none"}
      className={index < roundedRating ? "" : "text-[#e6dbcf]"}
    />
  ));
};

const RelatedProductCard = ({ product }) => {
  const displayPrice = getDisplayPrice(product);
  const reviewCount = product.reviews?.length || 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group overflow-hidden rounded-[1.6rem] border border-white/75 bg-white/[0.9] shadow-[0_22px_70px_-56px_rgba(61,39,24,0.46)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_80px_-50px_rgba(61,39,24,0.54)]"
    >
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#fbf9f6_0%,#efe4d8_100%)]">
        <button
          type="button"
          onClick={(event) => event.preventDefault()}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.9] text-[#8a7c74] shadow-sm transition hover:text-[#ef5b5b]"
        >
          <Heart size={16} />
        </button>

        <div className="aspect-[4/4.75] overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.24em] text-[#a49589]">
              StyleUp.
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-[#171312]">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-[#d7a033]">
          <div className="flex items-center gap-1">{renderStarRow(product.rating, 13)}</div>
          <span className="text-xs text-[#7d7168]">({reviewCount})</span>
        </div>

        <p className="mt-3 text-xl font-bold text-[#171312]">
          {formatINR(displayPrice)}
        </p>
      </div>
    </Link>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);

      try {
        const response = await productAPI.getById(id);
        const productData = response.data.product;
        const initialSelection = getInitialSelection(productData);

        setProduct(productData);
        setSelectedImageIndex(0);
        setSelectedColor(initialSelection.color);
        setSelectedSize(initialSelection.size);
        setQuantity(1);
        setActiveTab("description");
        dispatch(setCurrentProduct(productData));

        if (user) {
          await recommendationAPI.addViewed({ productId: id });
        }

        const [reviewsResponse, recsResponse] = await Promise.all([
          reviewAPI.getByProduct(id),
          recommendationAPI.getPersonalized({
            category: productData.category,
            excludeProductId: id,
          }),
        ]);

        setReviews(reviewsResponse.data.reviews || []);
        setRecommendations(recsResponse.data.recommendations || []);
      } catch (error) {
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [dispatch, id, user]);

  useEffect(() => {
    if (!product?.variants?.length || !selectedColor) {
      return;
    }

    const currentVariant = product.variants.find((variant) => variant.color === selectedColor);
    const hasSelectedSize = currentVariant?.sizes?.some(
      (size) => size.size === selectedSize && size.stock > 0,
    );
    const fallbackSize =
      currentVariant?.sizes?.find((size) => size.stock > 0) || currentVariant?.sizes?.[0];

    if (!hasSelectedSize && fallbackSize?.size) {
      setSelectedSize(fallbackSize.size);
      setQuantity(1);
    }
  }, [product, selectedColor, selectedSize]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const selectedStock = getVariantStock(product, selectedColor, selectedSize);

    if (selectedStock !== Number.POSITIVE_INFINITY) {
      setQuantity((current) => Math.min(Math.max(1, current), Math.max(1, selectedStock)));
    }
  }, [product, selectedColor, selectedSize]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    if (product?.variants?.length && (!selectedColor || !selectedSize)) {
      toast.error("Please select size and color");
      return;
    }

    try {
      const response = await cartAPI.add({
        productId: id,
        quantity,
        selectedSize,
        selectedColor,
      });

      dispatch(setCart(response.data.cart));
      toast.success("Item added to cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item");
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    if (!reviewTitle.trim() || !reviewText.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await reviewAPI.create({
        productId: id,
        rating,
        title: reviewTitle,
        comment: reviewText,
      });

      toast.success("Review submitted successfully");
      setReviewTitle("");
      setReviewText("");
      setRating(5);

      const response = await reviewAPI.getByProduct(id);
      setReviews(response.data.reviews || []);
      setActiveTab("reviews");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  const handleQuantityChange = (nextValue) => {
    if (!product) {
      return;
    }

    const selectedStock = getVariantStock(product, selectedColor, selectedSize);
    const maxAllowed =
      selectedStock === Number.POSITIVE_INFINITY ? 10 : Math.max(1, selectedStock);

    setQuantity(Math.min(Math.max(1, nextValue), maxAllowed));
  };

  const handleColorSelect = (color) => {
    if (!product) {
      return;
    }

    const nextVariant = product.variants.find((variant) => variant.color === color);
    const nextSize =
      nextVariant?.sizes?.find((size) => size.stock > 0)?.size ||
      nextVariant?.sizes?.[0]?.size ||
      "";

    setSelectedColor(color);
    setSelectedSize(nextSize);
    setQuantity(1);
  };

  const handleWishlistClick = () => {
    toast("Wishlist support can be added next");
  };

  if (isLoading) {
    return (
      <div className={`${sectionShell} py-10`}>
        <div className="grid gap-8 lg:grid-cols-[0.54fr_0.46fr]">
          <div className="grid gap-4 md:grid-cols-[88px_minmax(0,1fr)]">
            <div className="hidden gap-4 md:grid">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-[1.25rem] bg-[#f1e6db]"
                />
              ))}
            </div>
            <div className="aspect-[4/4.1] animate-pulse rounded-[2rem] bg-[#f1e6db]" />
          </div>
          <div className="space-y-4">
            <div className="h-9 w-28 animate-pulse rounded-full bg-[#f1e6db]" />
            <div className="h-16 w-3/4 animate-pulse rounded-[1.25rem] bg-[#f1e6db]" />
            <div className="h-6 w-1/2 animate-pulse rounded-full bg-[#f1e6db]" />
            <div className="h-10 w-1/3 animate-pulse rounded-full bg-[#f1e6db]" />
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-[#f1e6db]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`${sectionShell} py-12 text-center`}>
        <h1 className="font-serif text-4xl tracking-[-0.05em] text-[#171312]">
          Product not found
        </h1>
        <p className="mt-3 text-[#756961]">
          The item you are looking for is no longer available.
        </p>
      </div>
    );
  }

  const galleryImages = product.images?.length ? product.images : [null];
  const selectedImage = galleryImages[selectedImageIndex] || galleryImages[0];
  const displayPrice = getDisplayPrice(product);
  const discountPercent = getDiscountPercent(product);
  const reviewCount = reviews.length || product.reviews?.length || 0;
  const allSizes = sortSizes(getProductSizes(product));
  const availableColors = getProductColors(product);
  const selectedVariant = product.variants?.find((variant) => variant.color === selectedColor);
  const availableSizesForColor = selectedVariant?.sizes || [];
  const selectedStock = getVariantStock(product, selectedColor, selectedSize);
  const isInStock =
    selectedStock === Number.POSITIVE_INFINITY ? true : selectedStock > 0;
  const sku = `${(product.category || "SKU").slice(0, 3).toUpperCase()}-${String(
    product._id,
  )
    .slice(-5)
    .toUpperCase()}`;
  const descriptionBullets = [
    `${product.category} category essential`,
    `${availableColors.length || 1} color option${
      availableColors.length === 1 ? "" : "s"
    } available`,
    allSizes.length ? `Sizes: ${allSizes.join(", ")}` : "Flexible sizing selection",
    `${reviewCount} customer review${reviewCount === 1 ? "" : "s"} so far`,
  ];
  const tabItems = [
    { id: "description", label: "Description" },
    { id: "details", label: "Details" },
    { id: "size-fit", label: "Size & Fit" },
    { id: "reviews", label: `Reviews (${reviewCount})` },
    { id: "shipping", label: "Shipping & Returns" },
  ];

  return (
    <div className={`${sectionShell} py-8 sm:py-10`}>
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#7a6e65]">
        <Link to="/" className="transition hover:text-[#171312]">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="transition hover:text-[#171312]">
          Shop
        </Link>
        <ChevronRight size={14} />
        <Link
          to={`/shop?categories=${encodeURIComponent(product.category)}`}
          className="transition hover:text-[#171312]"
        >
          {product.category}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#171312]">{product.name}</span>
      </div>

      <section className="mt-6 grid gap-8 xl:grid-cols-[0.54fr_0.46fr]">
        <div className="grid gap-4 md:grid-cols-[88px_minmax(0,1fr)]">
          <div className="hidden gap-4 md:grid">
            {galleryImages.slice(0, 5).map((image, index) => (
              <button
                key={`${image || "fallback"}-${index}`}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className={`overflow-hidden rounded-[1.35rem] border bg-[linear-gradient(180deg,#fbf8f4_0%,#efe4d8_100%)] transition ${
                  selectedImageIndex === index
                    ? "border-[#ef5b5b] shadow-[0_20px_60px_-50px_rgba(239,91,91,0.55)]"
                    : "border-white/80 hover:border-[#efc8c3]"
                }`}
              >
                {image ? (
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="h-28 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-[#998b80]">
                    StyleUp.
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-[linear-gradient(180deg,#fcfaf7_0%,#efe4d8_100%)] shadow-[0_30px_90px_-64px_rgba(61,39,24,0.5)]">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full min-h-[420px] w-full object-cover sm:min-h-[560px]"
              />
            ) : (
              <div className="flex min-h-[420px] items-center justify-center sm:min-h-[560px]">
                <div className="text-center">
                  <p className="font-serif text-6xl tracking-[-0.05em] text-[#171312]">
                    StyleUp.
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.24em] text-[#8f8178]">
                    Curated fashion essential
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (selectedImage) {
                  window.open(selectedImage, "_blank", "noopener,noreferrer");
                }
              }}
              className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.92] text-[#171312] shadow-[0_16px_36px_-28px_rgba(61,39,24,0.62)] transition hover:bg-white"
            >
              <Search size={18} />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 md:hidden">
            {galleryImages.slice(0, 5).map((image, index) => (
              <button
                key={`mobile-${image || "fallback"}-${index}`}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className={`min-w-[76px] overflow-hidden rounded-[1.15rem] border bg-[linear-gradient(180deg,#fbf8f4_0%,#efe4d8_100%)] transition ${
                  selectedImageIndex === index
                    ? "border-[#ef5b5b]"
                    : "border-white/80"
                }`}
              >
                {image ? (
                  <img
                    src={image}
                    alt={`${product.name} mobile thumbnail ${index + 1}`}
                    className="h-24 w-[76px] object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-[76px] items-center justify-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#998b80]">
                    Style
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/[0.74] p-6 shadow-[0_24px_80px_-64px_rgba(61,39,24,0.38)] sm:p-8">
          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
              isInStock
                ? "bg-[#eaf7ef] text-[#2d9b52]"
                : "bg-[#fff2ef] text-[#ef5b5b]"
            }`}
          >
            {isInStock ? "In Stock" : "Out of Stock"}
          </span>

          <h1 className="mt-5 font-serif text-4xl tracking-[-0.05em] text-[#171312] sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#746960]">
            <div className="flex items-center gap-2 text-[#d7a033]">
              <div className="flex items-center gap-1">{renderStarRow(product.rating)}</div>
              <span className="text-[#5e534c]">{(product.rating || 0).toFixed(1)}</span>
              <span className="text-[#7c7067]">({reviewCount} Reviews)</span>
            </div>
            <span className="hidden h-4 w-px bg-[#ded1c3] sm:block" />
            <span>SKU: {sku}</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="text-4xl font-bold text-[#171312]">
              {formatINR(displayPrice)}
            </span>
            {product.discountPrice && (
              <span className="text-2xl text-[#9f9289] line-through">
                {formatINR(product.price)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="rounded-full bg-[#fff1ee] px-4 py-2 text-sm font-semibold text-[#ef5b5b]">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#5f5550]">
            {product.description}
          </p>

          <div className="mt-8 border-t border-[#ecdfd2] pt-8">
            {availableColors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-base text-[#171312]">
                  <span className="font-semibold">Color:</span>
                  <span className="text-[#6f635b]">{selectedColor || "Select"}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
                        selectedColor === color
                          ? "border-[#ef5b5b]"
                          : "border-transparent hover:border-[#efc8c3]"
                      }`}
                      title={color}
                    >
                      <span
                        className="h-7 w-7 rounded-full border border-black/10"
                        style={{ backgroundColor: getColorSwatch(color) }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableSizesForColor.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-base text-[#171312]">
                    <span className="font-semibold">Size:</span>
                    <span className="text-[#6f635b]">{selectedSize || "Select"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast("Choose your usual size for the best fit")}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#6f635b] transition hover:text-[#171312]"
                  >
                    <Ruler size={16} />
                    Size Guide
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {availableSizesForColor.map((sizeEntry) => {
                    const isSelected = selectedSize === sizeEntry.size;
                    const isDisabled = sizeEntry.stock === 0;

                    return (
                      <button
                        key={sizeEntry.size}
                        type="button"
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedSize(sizeEntry.size);
                            setQuantity(1);
                          }
                        }}
                        disabled={isDisabled}
                        className={`min-w-[3.25rem] rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          isSelected
                            ? "border-[#ef5b5b] bg-[#fff4f1] text-[#ef5b5b]"
                            : "border-[#e6d8ca] bg-white text-[#171312] hover:border-[#efc8c3]"
                        } ${isDisabled ? "cursor-not-allowed opacity-45" : ""}`}
                      >
                        {sizeEntry.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-[#171312]">Quantity</p>
                <div className="mt-3 inline-flex items-center overflow-hidden rounded-xl border border-[#e6d8ca] bg-white">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="flex h-12 w-12 items-center justify-center text-[#6f635b] transition hover:bg-[#fbf3ed] hover:text-[#171312]"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="flex h-12 min-w-[3rem] items-center justify-center border-x border-[#eee2d6] text-base font-semibold text-[#171312]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center text-[#6f635b] transition hover:bg-[#fbf3ed] hover:text-[#171312]"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {selectedStock !== Number.POSITIVE_INFINITY && (
                <div className="rounded-full bg-[#fbf5ef] px-4 py-2 text-sm text-[#7a6f67]">
                  {selectedStock > 0 ? `${selectedStock} left in stock` : "Currently sold out"}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="inline-flex flex-1 items-center justify-center gap-3 rounded-xl bg-[#171312] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
              >
                <ShoppingBag size={18} />
                {isInStock ? "Add to Cart" : "Out of Stock"}
              </button>

              <button
                type="button"
                onClick={handleWishlistClick}
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-[#1d1a18] bg-white px-6 py-4 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
              >
                <Heart size={18} />
                Add to Wishlist
              </button>
            </div>

            <div className="mt-8 grid gap-4 border-t border-[#ecdfd2] pt-8 sm:grid-cols-2 xl:grid-cols-4">
              {perks.map((perk) => {
                const Icon = perk.icon;

                return (
                  <div key={perk.title} className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#171312]">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#171312]">
                        {perk.title}
                      </p>
                      <p className="mt-1 text-sm text-[#7c7067]">{perk.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-10 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/[0.7] p-6 shadow-[0_24px_80px_-64px_rgba(61,39,24,0.36)] sm:p-8">
          <div className="flex flex-wrap gap-2 border-b border-[#eaded1] pb-4">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[#fff1ee] text-[#ef5b5b]"
                    : "text-[#6d625b] hover:text-[#171312]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-8">
            {activeTab === "description" && (
              <div>
                <p className="text-base leading-8 text-[#5f5550]">
                  {product.description}
                </p>
                <ul className="mt-6 space-y-3 text-base text-[#5f5550]">
                  {descriptionBullets.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ef5b5b]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "details" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] bg-[#fbf5ef] p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#9a6a5a]">
                    Category
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#171312]">
                    {product.category}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbf5ef] p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#9a6a5a]">
                    Colors
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#171312]">
                    {availableColors.length || 1} option
                    {availableColors.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbf5ef] p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#9a6a5a]">
                    Size Range
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#171312]">
                    {allSizes.length ? allSizes.join(", ") : "One size"}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbf5ef] p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#9a6a5a]">
                    Product Code
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#171312]">{sku}</p>
                </div>
              </div>
            )}

            {activeTab === "size-fit" && (
              <div>
                <p className="text-base leading-8 text-[#5f5550]">
                  This piece is designed for everyday comfort with a balanced
                  silhouette that layers easily over staples and works across
                  casual styling.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {(allSizes.length ? allSizes : ["One Size"]).map((size) => (
                    <span
                      key={size}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                        selectedSize === size
                          ? "border-[#ef5b5b] bg-[#fff4f1] text-[#ef5b5b]"
                          : "border-[#e6d8ca] bg-white text-[#171312]"
                      }`}
                    >
                      {size}
                    </span>
                  ))}
                </div>
                <div className="mt-6 rounded-[1.5rem] bg-[#fbf5ef] p-5 text-sm leading-7 text-[#655a53]">
                  For the closest fit, choose your usual size. If you prefer a
                  roomier layered look, go one size up when stock is available.
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {user && (
                  <div className="rounded-[1.75rem] border border-[#eaded1] bg-white/[0.86] p-5 shadow-[0_18px_60px_-54px_rgba(61,39,24,0.3)]">
                    <h3 className="text-xl font-semibold text-[#171312]">
                      Write a Review
                    </h3>

                    <div className="mt-5 grid gap-4">
                      <div>
                        <label
                          htmlFor="review-rating"
                          className="mb-2 block text-sm font-medium text-[#171312]"
                        >
                          Rating
                        </label>
                        <select
                          id="review-rating"
                          value={rating}
                          onChange={(event) => setRating(Number(event.target.value))}
                          className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
                        >
                          <option value={5}>5 - Excellent</option>
                          <option value={4}>4 - Good</option>
                          <option value={3}>3 - Average</option>
                          <option value={2}>2 - Fair</option>
                          <option value={1}>1 - Poor</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="review-title"
                          className="mb-2 block text-sm font-medium text-[#171312]"
                        >
                          Title
                        </label>
                        <input
                          id="review-title"
                          type="text"
                          value={reviewTitle}
                          onChange={(event) => setReviewTitle(event.target.value)}
                          placeholder="Review title"
                          className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition placeholder:text-[#9b9088] focus:border-[#efc9c3]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="review-comment"
                          className="mb-2 block text-sm font-medium text-[#171312]"
                        >
                          Review
                        </label>
                        <textarea
                          id="review-comment"
                          value={reviewText}
                          onChange={(event) => setReviewText(event.target.value)}
                          placeholder="Write your review"
                          rows="4"
                          className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition placeholder:text-[#9b9088] focus:border-[#efc9c3]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmitReview}
                        className="inline-flex w-fit items-center justify-center rounded-full bg-[#171312] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b]"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div
                        key={review._id}
                        className="rounded-[1.75rem] border border-[#eaded1] bg-white/[0.86] p-5 shadow-[0_18px_60px_-54px_rgba(61,39,24,0.3)]"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-base font-semibold text-[#171312]">
                              {review.user?.firstName || "Verified"}{" "}
                              {review.user?.lastName || "Customer"}
                            </p>
                            <div className="mt-2 flex items-center gap-1 text-[#d7a033]">
                              {renderStarRow(review.rating, 15)}
                            </div>
                          </div>
                          <p className="text-sm text-[#7a6f67]">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <h4 className="mt-4 text-lg font-semibold text-[#171312]">
                          {review.title}
                        </h4>
                        <p className="mt-2 text-base leading-7 text-[#615751]">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.75rem] border border-dashed border-[#dfd0c2] bg-white/[0.72] px-6 py-10 text-center text-[#7a6e65]">
                      No reviews yet. Be the first to review this item.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-[#fbf5ef] p-5">
                  <p className="text-lg font-semibold text-[#171312]">Shipping</p>
                  <p className="mt-3 text-sm leading-7 text-[#615751]">
                    Orders over ₹999 qualify for complimentary standard shipping.
                    Most in-stock items dispatch across India within 1 to 2 business days.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[#fbf5ef] p-5">
                  <p className="text-lg font-semibold text-[#171312]">Returns</p>
                  <p className="mt-3 text-sm leading-7 text-[#615751]">
                    Returns are accepted within 30 days in original condition.
                    Reach out to support anytime for fit help or delivery updates.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/[0.7] p-6 shadow-[0_24px_80px_-64px_rgba(61,39,24,0.36)] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-3xl tracking-[-0.05em] text-[#171312]">
              You May Also Like
            </h2>
            <Link
              to={`/shop?categories=${encodeURIComponent(product.category)}`}
              className="text-sm font-semibold text-[#ef5b5b] transition hover:text-[#d94d4d]"
            >
              View All
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recommendations.slice(0, 4).map((item) => (
              <RelatedProductCard key={item._id} product={item} />
            ))}
          </div>

          {!recommendations.length && (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-[#dfd0c2] bg-white/[0.72] px-6 py-10 text-center text-[#7a6e65]">
              More recommendations will appear here as shoppers browse similar
              pieces.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductPage;

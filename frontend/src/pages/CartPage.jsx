import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Heart,
  Info,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Tag,
  Trash2,
} from "lucide-react";
import { cartAPI, productAPI } from "../utils/api";
import { setCart } from "../redux/cartSlice";
import { formatINR, getDisplayPrice } from "../utils/productPresentation";

const sectionShell = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8";

const renderStars = (rating) => {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating || 0)));

  return Array.from({ length: 5 }).map((_, index) => (
    <span
      key={index}
      className={index < roundedRating ? "text-[#f0b33d]" : "text-[#e6dbcf]"}
    >
      ★
    </span>
  ));
};

const CartSuggestionCard = ({ product }) => {
  const displayPrice = getDisplayPrice(product);
  const reviewCount = product.reviews?.length || 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group overflow-hidden rounded-[1.55rem] border border-white/75 bg-white/[0.9] shadow-[0_22px_70px_-58px_rgba(61,39,24,0.44)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_84px_-52px_rgba(61,39,24,0.5)]"
    >
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#fbf9f5_0%,#efe4d8_100%)]">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            toast("Wishlist support can be added next");
          }}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.92] text-[#8c7d75] shadow-sm transition hover:text-[#ef5b5b]"
        >
          <Heart size={16} />
        </button>

        <div className="aspect-[4/4.8] overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.22em] text-[#a09084]">
              StyleUp.
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-[1rem] font-semibold text-[#171312]">
          {product.name}
        </h3>
        <p className="mt-3 text-xl font-bold text-[#171312]">
          {formatINR(displayPrice)}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
          <span className="text-[#7d7168]">({reviewCount})</span>
        </div>
      </div>
    </Link>
  );
};

const CartPage = () => {
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, totalPrice, discountAmount, discountCode } = useSelector(
    (state) => state.cart,
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await cartAPI.get();
        dispatch(setCart(response.data.cart));
      } catch (error) {
        toast.error("Failed to load cart");
      }
    };

    fetchCart();
  }, [dispatch, navigate, user]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const categorySet = [
          ...new Set(items.map((item) => item.product?.category).filter(Boolean)),
        ];
        const productIdsInCart = new Set(
          items.map((item) => item.product?._id).filter(Boolean),
        );
        const response = await productAPI.getAll({
          categories: categorySet.length ? categorySet.join(",") : undefined,
          sort: "popular",
          limit: 12,
          page: 1,
        });

        const filteredProducts = (response.data.products || []).filter(
          (product) => !productIdsInCart.has(product._id),
        );

        setRecommendations(filteredProducts.slice(0, 6));
      } catch (error) {
        setRecommendations([]);
      }
    };

    fetchRecommendations();
  }, [items]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      const response = await cartAPI.update({ itemId, quantity: newQuantity });
      dispatch(setCart(response.data.cart));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update item");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await cartAPI.remove(itemId);
      dispatch(setCart(response.data.cart));
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    if (!items.length) {
      return;
    }

    setIsClearingCart(true);

    try {
      const response = await cartAPI.clear();
      dispatch(setCart(response.data.cart || { items: [], totalPrice: 0, discountAmount: 0 }));
      toast.success("Cart cleared");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear cart");
    } finally {
      setIsClearingCart(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const response = await cartAPI.applyCoupon({ couponCode });
      dispatch(setCart(response.data.cart));
      toast.success("Coupon applied successfully");
      setCouponCode("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const subtotalAfterDiscount = Math.max(totalPrice - discountAmount, 0);
  const shippingCost = items.length === 0 ? 0 : subtotalAfterDiscount >= 999 ? 0 : 79;
  const estimatedTax = items.length === 0 ? 0 : (subtotalAfterDiscount + shippingCost) * 0.18;
  const orderTotal = subtotalAfterDiscount + shippingCost + estimatedTax;
  const freeShippingGap = Math.max(0, 999 - subtotalAfterDiscount);

  const itemCountLabel = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    return totalQuantity;
  }, [items]);

  if (!user) {
    return null;
  }

  return (
    <div className={`${sectionShell} py-8 sm:py-10`}>
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#7a6e65]">
        <Link to="/" className="transition hover:text-[#171312]">
          Home
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#171312]">Cart</span>
      </div>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-5xl tracking-[-0.05em] text-[#171312] sm:text-6xl">
            Shopping Cart ({itemCountLabel})
          </h1>
          <p className="mt-3 text-base text-[#6f635b]">
            Review your items and proceed to checkout
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            disabled={isClearingCart}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5f5550] transition hover:text-[#171312] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isClearingCart ? "Clearing..." : "Clear Cart"}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-[#dfd0c2] bg-white/[0.82] px-8 py-20 text-center shadow-[0_18px_60px_-56px_rgba(63,40,24,0.45)]">
          <h2 className="font-serif text-4xl tracking-[-0.05em] text-[#171312]">
            Your cart is empty
          </h2>
          <p className="mt-3 text-base leading-7 text-[#7a6e65]">
            Add a few pieces you love, then come back here to review your order.
          </p>
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#171312] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b]"
          >
            Start Shopping
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/[0.88] shadow-[0_24px_80px_-62px_rgba(61,39,24,0.42)]">
            <div className="hidden grid-cols-[minmax(0,1fr)_140px_180px_140px_56px] gap-4 border-b border-[#eee3d7] px-5 py-4 text-sm font-semibold text-[#5e534c] lg:grid">
              <span>Product</span>
              <span className="text-center">Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-center">Total</span>
              <span />
            </div>

            <div>
              {items.map((item) => {
                const itemTotal = Number(item.priceAtAddition || 0) * item.quantity;

                return (
                  <div
                    key={item._id}
                    className="grid gap-5 border-b border-[#f3e8dc] px-5 py-5 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_140px_180px_140px_56px] lg:items-center"
                  >
                    <div className="flex gap-4">
                      <Link
                        to={item.product?._id ? `/product/${item.product._id}` : "/shop"}
                        className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-[1.2rem] bg-[linear-gradient(180deg,#fbf9f5_0%,#efe4d8_100%)]"
                      >
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product?.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9e9085]">
                            Style
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0">
                        <Link
                          to={item.product?._id ? `/product/${item.product._id}` : "/shop"}
                          className="line-clamp-2 text-xl font-semibold text-[#171312] transition hover:text-[#ef5b5b]"
                        >
                          {item.product?.name || "Unavailable Product"}
                        </Link>

                        <div className="mt-2 space-y-1 text-sm text-[#6f635b]">
                          {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                          {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                        </div>

                        <button
                          type="button"
                          onClick={() => toast("Wishlist support can be added next")}
                          className="mt-4 inline-flex items-center gap-2 text-sm text-[#7c7067] transition hover:text-[#171312]"
                        >
                          <Heart size={14} />
                          Move to Wishlist
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[#171312] lg:block lg:text-center">
                      <span className="text-sm font-medium text-[#7a6f67] lg:hidden">
                        Price
                      </span>
                      <span className="text-xl font-semibold">
                        {formatINR(item.priceAtAddition)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between lg:justify-center">
                      <span className="text-sm font-medium text-[#7a6f67] lg:hidden">
                        Quantity
                      </span>
                      <div className="inline-flex items-center overflow-hidden rounded-xl border border-[#e6d8ca] bg-white">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                          className="flex h-10 w-10 items-center justify-center text-[#6f635b] transition hover:bg-[#fbf3ed] hover:text-[#171312]"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="flex h-10 min-w-[3rem] items-center justify-center border-x border-[#eee2d6] text-sm font-semibold text-[#171312]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center text-[#6f635b] transition hover:bg-[#fbf3ed] hover:text-[#171312]"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[#171312] lg:block lg:text-center">
                      <span className="text-sm font-medium text-[#7a6f67] lg:hidden">
                        Total
                      </span>
                      <span className="text-xl font-semibold">
                        {formatINR(itemTotal)}
                      </span>
                    </div>

                    <div className="flex justify-end lg:justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-[#8d7f77] transition hover:text-[#ef5b5b]"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/75 bg-white/[0.9] p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.42)] sm:p-7 h-fit">
            <h2 className="text-3xl font-semibold text-[#171312]">Order Summary</h2>

            <div className="mt-6 space-y-4 border-b border-[#eee3d7] pb-6 text-base text-[#4f4540]">
              <div className="flex items-center justify-between">
                <span>Subtotal ({itemCountLabel} items)</span>
                <span className="font-semibold text-[#171312]">
                  {formatINR(totalPrice)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-[#2d9b52]">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1">
                  Shipping
                  <Info size={14} className="text-[#9a8d84]" />
                </span>
                <span className="font-semibold text-[#171312]">
                  {shippingCost === 0 ? "Free" : formatINR(shippingCost)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1">
                  GST
                  <Info size={14} className="text-[#9a8d84]" />
                </span>
                <span className="font-semibold text-[#171312]">
                  {formatINR(estimatedTax)}
                </span>
              </div>
            </div>

            <div className="mt-6 border-b border-[#eee3d7] pb-6">
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold text-[#171312]">Total</span>
                <span className="text-4xl font-bold text-[#171312]">
                  {formatINR(orderTotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <p className="mt-3 text-sm font-medium text-[#2d9b52]">
                  You saved {formatINR(discountAmount)}
                </p>
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-base font-semibold text-[#171312]">
                  <Tag size={16} />
                  Apply Coupon Code
                </span>
                {discountCode && (
                  <span className="rounded-full bg-[#eef8f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2d9b52]">
                    {discountCode}
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Enter coupon code"
                  className="min-w-0 flex-1 rounded-xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition placeholder:text-[#9b9088] focus:border-[#efc9c3]"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                  className="rounded-xl bg-[#171312] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
                >
                  {isApplyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-[1.4rem] bg-[#edf8ef] px-4 py-4 text-sm text-[#2b7a40]">
              {shippingCost === 0 ? (
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="mt-0.5" />
                  <div>
                    <p className="font-semibold">Congrats! You got free shipping.</p>
                    <p className="mt-1 text-[#376f49]">
                      Your order already qualifies for complimentary delivery.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="mt-0.5" />
                  <div>
                    <p className="font-semibold">Free shipping is close.</p>
                    <p className="mt-1 text-[#376f49]">
                      Add {formatINR(freeShippingGap)} more to unlock free delivery.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/checkout")}
              disabled={items.length === 0}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#171312] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[#7c7067]">
              <Lock size={15} />
              Secure Checkout
            </div>
          </aside>
        </div>
      )}

      {recommendations.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-3xl tracking-[-0.05em] text-[#171312]">
              You may also like
            </h2>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#ef5b5b] transition hover:text-[#d94d4d]"
            >
              View All
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {recommendations.map((product) => (
              <CartSuggestionCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {items.length > 0 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="inline-flex items-center gap-3 rounded-xl border border-[#171312] bg-white px-5 py-3 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;

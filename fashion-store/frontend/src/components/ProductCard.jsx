import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { cartAPI } from "../utils/api";
import { setCart } from "../redux/cartSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const firstAvailableVariant = product.variants?.find((variant) =>
    variant.sizes?.some((size) => size.stock > 0),
  );
  const firstAvailableSize = firstAvailableVariant?.sizes?.find(
    (size) => size.stock > 0,
  );
  const canQuickAdd = Boolean(firstAvailableVariant && firstAvailableSize);

  const handleAddToCart = async (event) => {
    event.stopPropagation();

    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const response = await cartAPI.add({
        productId: product._id,
        quantity: 1,
        selectedSize: firstAvailableSize?.size,
        selectedColor: firstAvailableVariant?.color,
      });

      dispatch(setCart(response.data.cart));
      toast.success("Item added to cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item");
    }
  };

  const displayPrice = product.discountPrice || product.price;
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <article
      onClick={() => navigate(`/product/${product._id}`)}
      className="group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_24px_80px_-58px_rgba(69,43,27,0.55)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_100px_-54px_rgba(69,43,27,0.58)]"
    >
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#fbf8f4_0%,#efe6dd_100%)]">
        {product.discountPrice && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#ef5b5b] px-3 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}

        <span className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#d95f70] shadow-sm">
          <Heart size={18} />
        </span>

        <div className="aspect-[4/5] overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#f4ece4] text-sm font-semibold uppercase tracking-[0.28em] text-[#a39184]">
              Style Edit
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#fbf6f1] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#a06a5d]">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-[#d9a43c]">
            <Star size={15} fill="currentColor" />
            <span className="text-sm font-semibold text-[#4f433c]">
              {(product.rating || 0).toFixed(1)}
            </span>
          </div>
        </div>

        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-[#171312]">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-[#786c64]">
            {(product.reviews?.length || 0).toString()} reviews
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#171312]">
              ${displayPrice}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-[#a79a90] line-through">
                ${product.price}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canQuickAdd}
            className="inline-flex items-center gap-2 rounded-full border border-[#e4d8cc] bg-[#171312] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
          >
            <ShoppingBag size={16} />
            {canQuickAdd ? "Quick Add" : "Out of Stock"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

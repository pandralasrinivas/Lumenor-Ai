import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { cartAPI } from "../utils/api";
import { setCart } from "../redux/cartSlice";
import { formatINR } from "../utils/productPresentation";

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
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#eaded1] bg-white shadow-[0_18px_50px_-42px_rgba(69,43,27,0.42)] transition duration-300 hover:-translate-y-1 hover:border-[#decfc2] hover:shadow-[0_24px_70px_-46px_rgba(69,43,27,0.5)]"
    >
      <div className="relative overflow-hidden bg-[#f6efe8]">
        {product.discountPrice && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-[#ef5b5b] px-2.5 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}

        <span className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#d95f70] shadow-sm">
          <Heart size={18} />
        </span>

        <div className="aspect-[4/4.65] overflow-hidden">
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

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-md bg-[#fbf6f1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#a06a5d]">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-[#d9a43c]">
            <Star size={15} fill="currentColor" />
            <span className="text-sm font-semibold text-[#4f433c]">
              {(product.rating || 0).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="line-clamp-2 min-h-[3.25rem] text-lg font-semibold leading-7 text-[#171312]">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-[#786c64]">
            {(product.reviews?.length || 0).toString()} reviews
          </p>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex min-h-[2.25rem] flex-wrap items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#171312]">
              {formatINR(displayPrice)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-[#a79a90] line-through">
                {formatINR(product.price)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canQuickAdd}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#171312] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
          >
            <ShoppingBag size={16} />
            {canQuickAdd ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

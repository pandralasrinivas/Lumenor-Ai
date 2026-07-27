import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import {
  getColorSwatch,
  getDiscountPercent,
  getDisplayPrice,
  getProductColors,
} from "../utils/productPresentation";

const ShopProductCard = ({ product, viewMode = "grid" }) => {
  const navigate = useNavigate();
  const colors = getProductColors(product);
  const displayPrice = getDisplayPrice(product);
  const discountPercent = getDiscountPercent(product);
  const reviewCount = product.reviews?.length || 0;
  const roundedRating = Math.max(0, Math.min(5, Math.round(product.rating || 0)));

  return (
    <article
      onClick={() => navigate(`/product/${product._id}`)}
      className={`group cursor-pointer overflow-hidden border border-white/70 bg-white/[0.88] shadow-[0_26px_80px_-62px_rgba(61,39,24,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-56px_rgba(61,39,24,0.56)] ${
        viewMode === "list"
          ? "grid rounded-[2rem] sm:grid-cols-[240px_minmax(0,1fr)]"
          : "rounded-[1.85rem]"
      }`}
    >
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#fcfaf7_0%,#efe4d8_100%)]">
        {discountPercent > 0 && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#ef5b5b] px-3 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}

        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.92] text-[#8d7f76] shadow-sm transition hover:text-[#ef5b5b]"
        >
          <Heart size={18} />
        </button>

        <div
          className={`overflow-hidden ${
            viewMode === "list" ? "h-full min-h-[260px]" : "aspect-[4/4.9]"
          }`}
        >
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.28em] text-[#9b8c80]">
              StyleUp.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between p-5">
        <div>
          <h3 className="line-clamp-2 text-[1.15rem] font-semibold text-[#171312]">
            {product.name}
          </h3>

          <div className="mt-3 flex items-center gap-2 text-[#d7a033]">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  fill={index < roundedRating ? "currentColor" : "none"}
                  className={index < roundedRating ? "" : "text-[#e2d8ce]"}
                />
              ))}
            </div>
            <span className="text-sm text-[#7c7067]">({reviewCount})</span>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <span className="text-[1.85rem] font-bold text-[#171312]">
              ${displayPrice.toFixed(2)}
            </span>
            {product.discountPrice && (
              <span className="pb-1 text-sm text-[#9c9088] line-through">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          {viewMode === "list" && (
            <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-7 text-[#746960]">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#746960]">
              {colors.length} {colors.length === 1 ? "Color" : "Colors"}
            </span>
            <div className="flex items-center gap-2">
              {colors.slice(0, 5).map((color) => (
                <span
                  key={color}
                  className="h-4 w-4 rounded-full border border-black/10"
                  style={{ backgroundColor: getColorSwatch(color) }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ShopProductCard;

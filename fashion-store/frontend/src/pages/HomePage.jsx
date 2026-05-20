import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { productAPI } from "../utils/api";
import { setProducts } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";

const categories = ["Men", "Women", "Footwear", "Accessories"];

const perks = [
  {
    icon: Truck,
    title: "Free Shipping",
    copy: "On orders over $99",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    copy: "100% protected checkout",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    copy: "Always here to help",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    copy: "30 day return window",
  },
];

const sectionShell = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8";
const displayClass = "font-serif tracking-[-0.05em]";

const HomePage = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      try {
        const response = await productAPI.getAll({
          category: selectedCategory,
          search: searchTerm,
          page: 1,
          limit: 24,
        });

        dispatch(setProducts(response.data.products));
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 250);
    return () => clearTimeout(debounceTimer);
  }, [dispatch, searchTerm, selectedCategory]);

  const handleJumpTo = (sectionId) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCategorySelect = (category) => {
    const nextCategory = category === selectedCategory ? "" : category;
    const nextParams = new URLSearchParams(searchParams);

    if (nextCategory) {
      nextParams.set("category", nextCategory);
    } else {
      nextParams.delete("category");
    }

    setSearchParams(nextParams, { replace: true });
    handleJumpTo("featured");
  };

  const handleClearFilters = () => {
    setSearchParams({}, { replace: true });
    handleJumpTo("featured");
  };

  const featuredProducts = products.slice(0, 6);
  const newArrivals = [...products]
    .sort((first, second) => {
      return new Date(second.createdAt) - new Date(first.createdAt);
    })
    .slice(0, 4);
  const saleProducts = products.filter((product) => product.discountPrice).slice(0, 4);
  const displayNewArrivals = newArrivals.length
    ? newArrivals
    : featuredProducts.slice(0, 4);
  const showcaseProducts = saleProducts.length
    ? saleProducts
    : featuredProducts.slice(0, 4);
  const heroPrimaryProduct = products[0] || null;
  const heroSecondaryProduct = products[1] || heroPrimaryProduct;

  const collectionTiles = [
    {
      label: "Men",
      category: "Men",
      image: products.find((product) => product.category === "Men")?.images?.[0],
    },
    {
      label: "Women",
      category: "Women",
      image: products.find((product) => product.category === "Women")?.images?.[0],
    },
    {
      label: "Footwear",
      category: "Footwear",
      image: products.find((product) => product.category === "Footwear")?.images?.[0],
    },
    {
      label: "Accessories",
      category: "Accessories",
      image:
        products.find((product) => product.category === "Accessories")?.images?.[0],
    },
    {
      label: "New Arrivals",
      anchor: "new-arrivals",
      image: displayNewArrivals[0]?.images?.[0],
    },
    {
      label: "Sale",
      anchor: "sale-picks",
      image: showcaseProducts[0]?.images?.[0],
    },
  ];

  const storyStats = [
    {
      value: `${products.length}+`,
      label: "Styles in rotation",
    },
    {
      value: `${categories.length}`,
      label: "Core categories",
    },
    {
      value: `${products.filter((product) => product.discountPrice).length}+`,
      label: "Sale-ready finds",
    },
  ];

  return (
    <div className="pb-16">
      <section id="home" className={`${sectionShell} pt-4 sm:pt-6`}>
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-[linear-gradient(135deg,#fff9f4_0%,#f4e9dd_45%,#fff8f3_100%)] shadow-[0_36px_120px_-70px_rgba(84,48,30,0.58)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(240,190,170,0.35),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(231,213,197,0.45),transparent_28%)]" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="px-7 pb-8 pt-10 sm:px-10 lg:px-14 lg:pb-12 lg:pt-14">
              <span className="inline-flex rounded-full bg-[#fff2ef] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.26em] text-[#ef5b5b]">
                New Season Collection
              </span>

              <h1
                className={`mt-6 max-w-2xl text-5xl leading-[0.95] text-[#171312] sm:text-6xl lg:text-7xl ${displayClass}`}
              >
                Elevate Your Everyday Style
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[#6f655d]">
                Discover the latest trends in fashion with premium quality,
                refined essentials, and effortless pieces designed to move with
                you.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleJumpTo("featured")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171312] px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#ef5b5b]"
                >
                  Shop Now
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => handleJumpTo("collections")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9ccc1] bg-white/75 px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#171312] transition hover:border-[#efc9c3] hover:bg-white"
                >
                  Explore Collections
                </button>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                {perks.map((perk) => {
                  const Icon = perk.icon;

                  return (
                    <div
                      key={perk.title}
                      className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-[0_18px_50px_-46px_rgba(74,46,28,0.55)]"
                    >
                      <Icon size={22} className="text-[#171312]" />
                      <p className="mt-3 text-sm font-semibold text-[#171312]">
                        {perk.title}
                      </p>
                      <p className="mt-1 text-sm text-[#7a6e65]">{perk.copy}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative flex min-h-[360px] items-end justify-center px-6 pb-8 sm:px-10 lg:min-h-[620px] lg:px-10">
              <div className="absolute right-8 top-8 h-40 w-40 rounded-full bg-white/70 blur-3xl" />
              <div className="absolute bottom-10 left-8 h-40 w-40 rounded-full bg-[#f0b8aa]/30 blur-3xl" />

              {heroSecondaryProduct?.images?.[0] && (
                <div className="absolute left-4 top-8 hidden w-44 overflow-hidden rounded-[1.8rem] border border-white/80 bg-white shadow-[0_24px_90px_-62px_rgba(63,40,24,0.8)] sm:block lg:left-0 lg:top-10 lg:w-52">
                  <img
                    src={heroSecondaryProduct.images[0]}
                    alt={heroSecondaryProduct.name}
                    className="h-64 w-full object-cover sm:h-72"
                  />
                </div>
              )}

              <div className="relative w-full max-w-[460px] overflow-hidden rounded-[2.25rem] border border-white/80 bg-[#efe0d2] shadow-[0_36px_120px_-70px_rgba(63,40,24,0.9)]">
                {heroPrimaryProduct?.images?.[0] ? (
                  <img
                    src={heroPrimaryProduct.images[0]}
                    alt={heroPrimaryProduct.name}
                    className="h-[360px] w-full object-cover sm:h-[440px] lg:h-[560px]"
                  />
                ) : (
                  <div className="flex h-[360px] items-center justify-center bg-[linear-gradient(180deg,#f7ece4_0%,#ebddd0_100%)] sm:h-[440px] lg:h-[560px]">
                    <div className="text-center">
                      <p className={`text-6xl text-[#171312] ${displayClass}`}>
                        StyleUp.
                      </p>
                      <p className="mt-3 text-sm uppercase tracking-[0.28em] text-[#8d7f76]">
                        Curated Fashion Essentials
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-6 right-4 rounded-[1.5rem] border border-white/80 bg-white/[0.92] p-4 shadow-[0_24px_80px_-56px_rgba(63,40,24,0.75)] sm:right-8 sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1ef] text-[#ef5b5b]">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <p className="font-semibold text-[#171312]">Spring Sale</p>
                    <p className="text-sm text-[#756961]">
                      Up to 50% Off selected essentials
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJumpTo("sale-picks")}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef5b5b] text-white"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="collections" className={`${sectionShell} mt-12`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#ef5b5b]">
              Shop by Collection
            </p>
            <h2 className={`mt-3 text-4xl text-[#171312] sm:text-5xl ${displayClass}`}>
              Find the mood that fits your day
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-7 text-[#766a61]">
            Explore quick category jumps, latest drops, and discounted edits
            from the storefront.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {collectionTiles.map((tile) => (
            <button
              key={tile.label}
              type="button"
              onClick={() => {
                if (tile.category) {
                  handleCategorySelect(tile.category);
                  return;
                }

                handleJumpTo(tile.anchor);
              }}
              className="group rounded-[2rem] border border-white/70 bg-white/90 p-4 text-center shadow-[0_18px_60px_-50px_rgba(63,40,24,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-46px_rgba(63,40,24,0.55)]"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#faf3eb_0%,#ece0d4_100%)] ring-1 ring-black/5">
                {tile.image ? (
                  <img
                    src={tile.image}
                    alt={tile.label}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className={`text-4xl text-[#171312] ${displayClass}`}>
                    {tile.label.charAt(0)}
                  </span>
                )}
              </div>
              <span className="mt-4 block text-sm font-semibold text-[#171312]">
                {tile.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section id="featured" className={`${sectionShell} mt-14`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#ef5b5b]">
              Featured Products
            </p>
            <h2 className={`mt-3 text-4xl text-[#171312] sm:text-5xl ${displayClass}`}>
              {selectedCategory
                ? `${selectedCategory} picks curated for you`
                : searchTerm
                  ? `Results for "${searchTerm}"`
                  : "A refined edit of standout pieces"}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#dfd3c8] bg-white/80 px-5 py-3 text-sm font-semibold text-[#171312] transition hover:border-[#efc9c3] hover:bg-white"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleClearFilters}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              !selectedCategory
                ? "bg-[#171312] text-white"
                : "bg-white/[0.85] text-[#171312] shadow-sm hover:bg-white"
            }`}
          >
            All Products
          </button>

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategorySelect(category)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-[#ef5b5b] text-white"
                  : "bg-white/[0.85] text-[#171312] shadow-sm hover:bg-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-[0_20px_70px_-58px_rgba(63,40,24,0.55)]"
                >
                  <div className="aspect-[4/5] animate-pulse rounded-[1.4rem] bg-[#f1e6dc]" />
                  <div className="mt-4 h-4 animate-pulse rounded-full bg-[#f1e6dc]" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-[#f1e6dc]" />
                  <div className="mt-5 h-11 animate-pulse rounded-full bg-[#f1e6dc]" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#dfd0c2] bg-white/75 px-8 py-16 text-center shadow-[0_18px_60px_-56px_rgba(63,40,24,0.45)]">
              <p className={`text-4xl text-[#171312] ${displayClass}`}>
                No products found
              </p>
              <p className="mt-3 text-sm text-[#7a6e65]">
                Try a different search or clear the current filter to see the
                full collection.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="new-arrivals" className={`${sectionShell} mt-16`}>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/70 bg-[#171312] px-8 py-10 text-white shadow-[0_28px_100px_-62px_rgba(28,18,14,0.8)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#f7b5ab]">
              New Arrivals
            </p>
            <h2 className={`mt-4 text-4xl sm:text-5xl ${displayClass}`}>
              Fresh layers, clean silhouettes, and new-season energy.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/75">
              Discover recently added pieces styled for everyday wear, elevated
              textures, and easy mix-and-match wardrobes.
            </p>
            <button
              type="button"
              onClick={() => handleJumpTo("featured")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#171312] transition hover:bg-[#fff1ee]"
            >
              Shop the edit
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {displayNewArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="sale-picks" className={`${sectionShell} mt-16`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#ef5b5b]">
              Sale Picks
            </p>
            <h2 className={`mt-3 text-4xl text-[#171312] sm:text-5xl ${displayClass}`}>
              Spotlight offers with polished appeal
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-7 text-[#766a61]">
            Shop markdown-ready essentials and quick-moving favorites chosen to
            mirror the landing page reference styling.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {showcaseProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section id="story" className={`${sectionShell} mt-16`}>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/[0.82] px-8 py-10 shadow-[0_24px_80px_-60px_rgba(63,40,24,0.52)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#ef5b5b]">
              About the Edit
            </p>
            <h2
              className={`mt-4 max-w-2xl text-4xl text-[#171312] sm:text-5xl ${displayClass}`}
            >
              Built to feel premium, easy to browse, and ready for real-world
              shopping.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[#6d6159]">
              This storefront blends fashion-forward presentation with practical
              commerce flows, so visitors can discover products quickly and move
              from inspiration to checkout without friction.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {storyStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] bg-[#fbf6f1] px-5 py-5"
                >
                  <p className={`text-4xl text-[#171312] ${displayClass}`}>
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-[#786c64]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,#fff8f2_0%,#f7efe6_100%)] px-7 py-8 shadow-[0_22px_72px_-58px_rgba(63,40,24,0.52)]">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#a06a5d]">
                Why it works
              </p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[#5b5049]">
                <p>
                  A warm editorial layout makes the catalog feel curated instead
                  of crowded.
                </p>
                <p>
                  Category shortcuts, promo highlights, and sharp product cards
                  keep the browsing flow fast.
                </p>
                <p>
                  Existing shopping features stay intact underneath the new
                  landing page presentation.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-[#171312] px-7 py-8 text-white shadow-[0_22px_72px_-58px_rgba(28,18,14,0.9)]">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f6b7ad]">
                Contact
              </p>
              <p className={`mt-4 text-3xl ${displayClass}`}>
                Need styling help or product support?
              </p>
              <div className="mt-5 space-y-2 text-sm text-white/75">
                <p>Email: info@fashionstore.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Hours: Monday to Saturday, 9 AM to 7 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

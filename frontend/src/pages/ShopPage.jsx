import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { productAPI } from "../utils/api";
import ShopProductCard from "../components/ShopProductCard";
import {
  getColorSwatch,
  getDisplayPrice,
  formatINR,
  getProductColors,
  getProductSizes,
  sortSizes,
} from "../utils/productPresentation";

const sectionShell = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8";
const categories = ["Men", "Women", "Footwear", "Accessories"];
const ratingOptions = [4, 3, 2, 1];
const sortOptions = [
  { label: "Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Best Discount", value: "discount" },
];
const defaultPagination = {
  total: 0,
  pages: 1,
  currentPage: 1,
  limit: 12,
};

const parseCsvParam = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildPaginationItems = (currentPage, totalPages) => {
  if (totalPages <= 1) {
    return [1];
  }

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push("left-ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push("right-ellipsis");
  }

  items.push(totalPages);
  return items;
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    size: true,
    color: true,
    rating: true,
  });
  const [draftFilters, setDraftFilters] = useState({
    categories: [],
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 200,
    minRating: 0,
  });

  const searchParamsString = searchParams.toString();
  const activeSearch = React.useMemo(
    () => searchParams.get("search") || "",
    [searchParams, searchParamsString],
  );
  const activeCategories = React.useMemo(
    () =>
      parseCsvParam(
        searchParams.get("categories") || searchParams.get("category"),
      ),
    [searchParams, searchParamsString],
  );
  const activeSizes = React.useMemo(
    () => parseCsvParam(searchParams.get("sizes")),
    [searchParams, searchParamsString],
  );
  const activeColors = React.useMemo(
    () => parseCsvParam(searchParams.get("colors")),
    [searchParams, searchParamsString],
  );
  const activeMinRating = React.useMemo(
    () => Number(searchParams.get("minRating") || 0),
    [searchParams, searchParamsString],
  );
  const activeSort = React.useMemo(
    () => searchParams.get("sort") || "popular",
    [searchParams, searchParamsString],
  );
  const activePage = React.useMemo(
    () => Math.max(1, Number(searchParams.get("page") || 1)),
    [searchParams, searchParamsString],
  );
  const catalogPriceValues = catalogProducts.map((product) =>
    getDisplayPrice(product),
  );
  const minimumCatalogPrice = catalogPriceValues.length
    ? Math.floor(Math.min(...catalogPriceValues))
    : 0;
  const maximumCatalogPrice = catalogPriceValues.length
    ? Math.ceil(Math.max(...catalogPriceValues))
    : 200;
  const rawMinPrice = React.useMemo(
    () => Number(searchParams.get("minPrice") || minimumCatalogPrice),
    [searchParams, searchParamsString, minimumCatalogPrice],
  );
  const rawMaxPrice = React.useMemo(
    () => Number(searchParams.get("maxPrice") || maximumCatalogPrice),
    [searchParams, searchParamsString, maximumCatalogPrice],
  );
  const activeMinPrice = Number.isFinite(rawMinPrice)
    ? rawMinPrice
    : minimumCatalogPrice;
  const activeMaxPrice = Number.isFinite(rawMaxPrice)
    ? rawMaxPrice
    : maximumCatalogPrice;

  useEffect(() => {
    const fetchCatalogProducts = async () => {
      try {
        const response = await productAPI.getAll({
          page: 1,
          limit: 1000,
          sort: "popular",
        });

        setCatalogProducts(response.data.products || []);
      } catch (error) {
        toast.error("Failed to load shop filters");
      } finally {
        setIsCatalogLoading(false);
      }
    };

    fetchCatalogProducts();
  }, []);

  useEffect(() => {
    setDraftFilters({
      categories: activeCategories,
      sizes: activeSizes,
      colors: activeColors,
      minPrice: activeMinPrice,
      maxPrice: activeMaxPrice,
      minRating: activeMinRating,
    });
  }, [
    activeCategories,
    activeSizes,
    activeColors,
    activeMinPrice,
    activeMaxPrice,
    activeMinRating,
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      try {
        const params = {
          page: activePage,
          limit: 12,
          sort: activeSort,
        };

        if (activeSearch) {
          params.search = activeSearch;
        }

        if (activeCategories.length) {
          params.categories = activeCategories.join(",");
        }

        if (activeSizes.length) {
          params.sizes = activeSizes.join(",");
        }

        if (activeColors.length) {
          params.colors = activeColors.join(",");
        }

        if (activeMinPrice > minimumCatalogPrice) {
          params.minPrice = activeMinPrice;
        }

        if (activeMaxPrice < maximumCatalogPrice) {
          params.maxPrice = activeMaxPrice;
        }

        if (activeMinRating > 0) {
          params.minRating = activeMinRating;
        }

        const response = await productAPI.getAll(params);
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || defaultPagination);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [
    activePage,
    activeSearch,
    activeCategories,
    activeSizes,
    activeColors,
    activeMinPrice,
    activeMaxPrice,
    activeMinRating,
    activeSort,
    minimumCatalogPrice,
    maximumCatalogPrice,
  ]);

  const toggleDraftListValue = (key, value) => {
    setDraftFilters((current) => {
      const currentValues = current[key];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...current,
        [key]: nextValues,
      };
    });
  };

  const updateDraftPrice = (key, value) => {
    const parsedValue = Number(value);

    setDraftFilters((current) => {
      if (key === "minPrice") {
        return {
          ...current,
          minPrice: Math.min(parsedValue, current.maxPrice),
        };
      }

      return {
        ...current,
        maxPrice: Math.max(parsedValue, current.minPrice),
      };
    });
  };

  const applyFilters = () => {
    const nextParams = new URLSearchParams(searchParams);

    if (draftFilters.categories.length) {
      nextParams.set("categories", draftFilters.categories.join(","));
    } else {
      nextParams.delete("categories");
      nextParams.delete("category");
    }

    if (draftFilters.sizes.length) {
      nextParams.set("sizes", draftFilters.sizes.join(","));
    } else {
      nextParams.delete("sizes");
    }

    if (draftFilters.colors.length) {
      nextParams.set("colors", draftFilters.colors.join(","));
    } else {
      nextParams.delete("colors");
    }

    if (draftFilters.minPrice > minimumCatalogPrice) {
      nextParams.set("minPrice", String(draftFilters.minPrice));
    } else {
      nextParams.delete("minPrice");
    }

    if (draftFilters.maxPrice < maximumCatalogPrice) {
      nextParams.set("maxPrice", String(draftFilters.maxPrice));
    } else {
      nextParams.delete("maxPrice");
    }

    if (draftFilters.minRating > 0) {
      nextParams.set("minRating", String(draftFilters.minRating));
    } else {
      nextParams.delete("minRating");
    }

    nextParams.set("page", "1");
    setSearchParams(nextParams);
    setIsMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams();

    if (activeSearch) {
      nextParams.set("search", activeSearch);
    }

    if (activeSort !== "popular") {
      nextParams.set("sort", activeSort);
    }

    setSearchParams(nextParams);
    setIsMobileFiltersOpen(false);
  };

  const handleSortChange = (event) => {
    const nextParams = new URLSearchParams(searchParams);
    const nextSort = event.target.value;

    if (nextSort === "popular") {
      nextParams.delete("sort");
    } else {
      nextParams.set("sort", nextSort);
    }

    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const handlePageChange = (page) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(page));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSection = (section) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const categoryCounts = categories.map((category) => ({
    label: category,
    count: catalogProducts.filter((product) => product.category === category)
      .length,
  }));
  const sizeOptions = sortSizes(
    [
      ...new Set(
        catalogProducts.flatMap((product) => getProductSizes(product)),
      ),
    ].filter(Boolean),
  );
  const colorOptions = [
    ...new Set(catalogProducts.flatMap((product) => getProductColors(product))),
  ].filter(Boolean);
  const ratingCounts = ratingOptions.map((rating) => ({
    rating,
    count: catalogProducts.filter(
      (product) => Number(product.rating || 0) >= rating,
    ).length,
  }));
  const showingFrom = pagination.total
    ? (pagination.currentPage - 1) * pagination.limit + 1
    : 0;
  const showingTo = pagination.total
    ? Math.min(pagination.currentPage * pagination.limit, pagination.total)
    : 0;
  const paginationItems = buildPaginationItems(
    pagination.currentPage,
    pagination.pages || 1,
  );

  return (
    <div className={`${sectionShell} py-8 sm:py-10`}>
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#7a6e65]">
        <Link to="/" className="transition hover:text-[#171312]">
          Home
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#171312]">Shop</span>
      </div>

      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-5xl tracking-[-0.05em] text-[#171312] sm:text-6xl">
            All Products
          </h1>
          <p className="mt-3 text-sm text-[#6f635b] sm:text-base">
            {pagination.total
              ? `Showing ${showingFrom}-${showingTo} of ${pagination.total} results`
              : "No products matched your current filters"}
          </p>
          {activeSearch && (
            <p className="mt-2 text-sm text-[#9a6a5a]">
              Search results for "{activeSearch}"
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-[#e6d8ca] bg-white/[0.88] px-5 py-3 text-sm font-semibold text-[#171312] shadow-[0_14px_40px_-36px_rgba(64,38,22,0.45)] transition hover:border-[#efc8c3] lg:hidden"
          >
            {isMobileFiltersOpen ? (
              <X size={17} />
            ) : (
              <SlidersHorizontal size={17} />
            )}
            Filters
          </button>

          <div className="flex items-center gap-3 rounded-full border border-[#eaded1] bg-white/[0.84] px-4 py-3">
            <span className="text-sm text-[#746960]">Sort by:</span>
            <select
              value={activeSort}
              onChange={handleSortChange}
              className="border-none bg-transparent pr-6 text-sm font-semibold text-[#171312] focus:outline-none focus:ring-0"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#eaded1] bg-white/[0.84] p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                viewMode === "grid"
                  ? "bg-[#ef5b5b] text-white"
                  : "text-[#8e8077] hover:bg-[#f8efe8]"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                viewMode === "list"
                  ? "bg-[#ef5b5b] text-white"
                  : "text-[#8e8077] hover:bg-[#f8efe8]"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside
          className={`${isMobileFiltersOpen ? "block" : "hidden"} lg:block`}
        >
          <div className="rounded-[2rem] border border-white/75 bg-white/[0.88] p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.42)]">
            <div className="space-y-6">
              <div className="border-b border-[#eee4d8] pb-6">
                <button
                  type="button"
                  onClick={() => toggleSection("categories")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-base font-semibold text-[#171312]">
                    Categories
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition ${openSections.categories ? "rotate-180" : ""}`}
                  />
                </button>

                {openSections.categories && (
                  <div className="mt-5 space-y-3">
                    {categoryCounts.map((category) => (
                      <label
                        key={category.label}
                        className="flex items-center justify-between gap-3 text-sm text-[#4d433d]"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={draftFilters.categories.includes(
                              category.label,
                            )}
                            onChange={() =>
                              toggleDraftListValue("categories", category.label)
                            }
                            className="h-4 w-4 rounded border-[#d8c9bb] text-[#ef5b5b] focus:ring-[#efc8c3]"
                          />
                          {category.label}
                        </span>
                        <span className="text-[#9b8f87]">
                          ({category.count})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-b border-[#eee4d8] pb-6">
                <button
                  type="button"
                  onClick={() => toggleSection("price")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-base font-semibold text-[#171312]">
                    Price Range
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition ${openSections.price ? "rotate-180" : ""}`}
                  />
                </button>

                {openSections.price && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm text-[#6f635b]">
                      <span>{formatINR(draftFilters.minPrice)}</span>
                      <span>{formatINR(draftFilters.maxPrice)}</span>
                    </div>
                    <div className="mt-4 space-y-4">
                      <input
                        type="range"
                        min={minimumCatalogPrice}
                        max={maximumCatalogPrice}
                        value={draftFilters.minPrice}
                        onChange={(event) =>
                          updateDraftPrice("minPrice", event.target.value)
                        }
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#f0e4d8] accent-[#ef5b5b]"
                      />
                      <input
                        type="range"
                        min={minimumCatalogPrice}
                        max={maximumCatalogPrice}
                        value={draftFilters.maxPrice}
                        onChange={(event) =>
                          updateDraftPrice("maxPrice", event.target.value)
                        }
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#f0e4d8] accent-[#ef5b5b]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-[#eee4d8] pb-6">
                <button
                  type="button"
                  onClick={() => toggleSection("size")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-base font-semibold text-[#171312]">
                    Size
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition ${openSections.size ? "rotate-180" : ""}`}
                  />
                </button>

                {openSections.size && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleDraftListValue("sizes", size)}
                        className={`min-w-[3rem] rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                          draftFilters.sizes.includes(size)
                            ? "border-[#ef5b5b] bg-[#fff2ef] text-[#ef5b5b]"
                            : "border-[#e7d9cc] bg-white text-[#171312] hover:border-[#efc8c3]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-b border-[#eee4d8] pb-6">
                <button
                  type="button"
                  onClick={() => toggleSection("color")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-base font-semibold text-[#171312]">
                    Color
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition ${openSections.color ? "rotate-180" : ""}`}
                  />
                </button>

                {openSections.color && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleDraftListValue("colors", color)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                          draftFilters.colors.includes(color)
                            ? "border-[#ef5b5b]"
                            : "border-transparent hover:border-[#efc8c3]"
                        }`}
                        title={color}
                      >
                        <span
                          className="h-6 w-6 rounded-full border border-black/10"
                          style={{ backgroundColor: getColorSwatch(color) }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("rating")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-base font-semibold text-[#171312]">
                    Rating
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition ${openSections.rating ? "rotate-180" : ""}`}
                  />
                </button>

                {openSections.rating && (
                  <div className="mt-5 space-y-3">
                    {ratingCounts.map((item) => (
                      <label
                        key={item.rating}
                        className="flex items-center justify-between gap-3 text-sm text-[#4d433d]"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="rating"
                            checked={draftFilters.minRating === item.rating}
                            onChange={() =>
                              setDraftFilters((current) => ({
                                ...current,
                                minRating:
                                  current.minRating === item.rating
                                    ? 0
                                    : item.rating,
                              }))
                            }
                            className="h-4 w-4 border-[#d8c9bb] text-[#ef5b5b] focus:ring-[#efc8c3]"
                          />
                          {item.rating}+ stars
                        </span>
                        <span className="text-[#9b8f87]">({item.count})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={applyFilters}
              disabled={isCatalogLoading}
              className="mt-8 w-full rounded-full bg-[#171312] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b9aea7]"
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 w-full text-sm font-semibold text-[#ef5b5b] transition hover:text-[#d94d4d]"
            >
              Clear All
            </button>
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div
              className={`grid gap-5 ${
                viewMode === "grid"
                  ? "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[1.85rem] border border-white/70 bg-white/[0.82] p-4 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.42)]"
                >
                  <div className="aspect-[4/4.9] animate-pulse rounded-[1.4rem] bg-[#f2e6db]" />
                  <div className="mt-4 h-4 animate-pulse rounded-full bg-[#f2e6db]" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-[#f2e6db]" />
                  <div className="mt-5 h-10 w-1/2 animate-pulse rounded-full bg-[#f2e6db]" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div
                className={`grid gap-5 ${
                  viewMode === "grid"
                    ? "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {products.map((product) => (
                  <ShopProductCard
                    key={product._id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(Math.max(1, pagination.currentPage - 1))
                    }
                    disabled={pagination.currentPage === 1}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eaded1] bg-white/[0.85] text-[#171312] transition hover:border-[#efc8c3] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {paginationItems.map((item) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handlePageChange(item)}
                        className={`flex h-11 min-w-[2.75rem] items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
                          item === pagination.currentPage
                            ? "bg-[#ef5b5b] text-white"
                            : "bg-white/[0.85] text-[#171312] hover:bg-[#fff2ef]"
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span
                        key={item}
                        className="flex h-11 min-w-[2.75rem] items-center justify-center text-sm text-[#8b7f77]"
                      >
                        ...
                      </span>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(
                        Math.min(pagination.pages, pagination.currentPage + 1),
                      )
                    }
                    disabled={pagination.currentPage === pagination.pages}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eaded1] bg-white/[0.85] text-[#171312] transition hover:border-[#efc8c3] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#dfd0c2] bg-white/[0.82] px-8 py-20 text-center shadow-[0_18px_60px_-56px_rgba(63,40,24,0.45)]">
              <h2 className="font-serif text-4xl tracking-[-0.05em] text-[#171312]">
                No matching products
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#7a6e65]">
                Try broadening the filters or clearing the current selection to
                see more pieces.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-[#171312] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b]"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Edit2,
  Eye,
  PackagePlus,
  RefreshCcw,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import { adminAPI } from "../../utils/api";
import AdminProductForm from "../components/AdminProductForm";

const categories = ["All", "Men", "Women", "Footwear", "Accessories"];

const getDiscountPercent = (product) => {
  const price = Number(product?.price || 0);
  const discountPrice = Number(product?.discountPrice || 0);

  if (!price || !discountPrice || discountPrice >= price) {
    return 0;
  }

  return Math.round(((price - discountPrice) / price) * 100);
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = {
        page: 1,
        limit: 50,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (category !== "All") {
        params.category = category;
      }

      if (activeFilter !== "all") {
        params.isActive = activeFilter === "active";
      }

      const response = await adminAPI.getProducts(params);
      setProducts(response.data.products || []);
      setPagination(
        response.data.pagination || { total: 0, pages: 1, currentPage: 1 },
      );
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, category, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadProducts]);

  const handleCreate = () => {
    setFormMode("create");
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product) => {
    setFormMode("edit");
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (payload) => {
    setIsSaving(true);

    try {
      if (formMode === "edit" && editingProduct?._id) {
        await adminAPI.updateProduct(editingProduct._id, payload);
        toast.success("Product updated successfully");
      } else {
        await adminAPI.createProduct(payload);
        toast.success("Product created successfully");
      }

      setIsFormOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async (productId) => {
    try {
      await adminAPI.archiveProduct(productId);
      toast.success("Product archived");
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to archive product");
    }
  };

  const handleRestore = async (productId) => {
    try {
      await adminAPI.restoreProduct(productId);
      toast.success("Product restored");
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to restore product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/75 bg-white/86 p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.38)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7767]">
              Catalog Management
            </p>
            <h2 className="mt-2 font-serif text-4xl tracking-[-0.05em] text-[#171312]">
              Products and media
            </h2>
            <p className="mt-3 text-base text-[#746960]">
              Create, update, archive, and restore the product catalog.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadProducts}
              className="inline-flex items-center gap-2 rounded-full border border-[#ddd1c6] bg-white px-4 py-3 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-full bg-[#171312] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b]"
            >
              <PackagePlus size={16} />
              New Product
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8f87]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products by name or description"
              className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-12 py-3 text-[#171312] outline-none transition placeholder:text-[#9b8f87] focus:border-[#efc9c3]"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item} Category
              </option>
            ))}
          </select>

          <select
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
            className="rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/75 bg-white/86 p-4 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.38)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a7767]">
            {pagination.total} product records
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-[1.6rem] bg-[#f3ebe3]"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {products.map((product) => {
              const discountPercent = getDiscountPercent(product);

              return (
                <div
                  key={product._id}
                  className="rounded-[1.6rem] border border-[#eaded1] bg-[#fffdfa] p-5"
                >
                  <div className="flex gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-[1.2rem] bg-[#f5eee6]">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b8f87]">
                          No media
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold text-[#171312]">
                          {product.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                            product.isActive
                              ? "bg-[#edf8ef] text-[#2d9b52]"
                              : "bg-[#fff1ee] text-[#ef5b5b]"
                          }`}
                        >
                          {product.isActive ? "Active" : "Archived"}
                        </span>
                        {discountPercent > 0 && (
                          <span className="rounded-full bg-[#fff1ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#ef5b5b]">
                            {discountPercent}% off
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-[#746960]">
                        {product.category} · ${Number(product.price || 0).toFixed(2)}
                        {product.discountPrice
                          ? ` · Final $${Number(product.discountPrice).toFixed(2)}`
                          : ""}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#746960]">
                        {product.description}
                      </p>
                      <p className="mt-3 text-sm text-[#8b7f77]">
                        {product.images?.length || 0} images ·{" "}
                        {product.variants?.length || 0} variants
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#ddd1c6] bg-white px-4 py-2 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
                    >
                      <Edit2 size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          `/product/${product._id}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-[#ddd1c6] bg-white px-4 py-2 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
                    >
                      <Eye size={15} />
                      Preview
                    </button>

                    {product.isActive ? (
                      <button
                        type="button"
                        onClick={() => handleArchive(product._id)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#f0d4cf] bg-[#fff4f1] px-4 py-2 text-sm font-semibold text-[#ef5b5b] transition hover:bg-[#fff1ee]"
                      >
                        <Trash2 size={15} />
                        Archive
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(product._id)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d6ebdc] bg-[#eef8f2] px-4 py-2 text-sm font-semibold text-[#2d9b52] transition hover:bg-[#eaf7ef]"
                      >
                        <Undo2 size={15} />
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-[#d9ccc1] bg-[#fffdfa] px-6 py-14 text-center text-[#746960]">
            No products match the current filters.
          </div>
        )}
      </div>

      <AdminProductForm
        isOpen={isFormOpen}
        mode={formMode}
        product={editingProduct}
        isSaving={isSaving}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
      />
    </div>
  );
};

export default AdminProductsPage;

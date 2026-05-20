import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

const categories = ["Men", "Women", "Footwear", "Accessories"];

const createBlankVariant = () => ({
  color: "",
  sizes: [{ size: "", stock: 0 }],
});

const createInitialState = (product) => ({
  name: product?.name || "",
  description: product?.description || "",
  category: product?.category || "Men",
  price: product?.price ?? "",
  discountPrice: product?.discountPrice ?? "",
  isActive: typeof product?.isActive === "boolean" ? product.isActive : true,
  images: product?.images?.length ? product.images : [""],
  variants: product?.variants?.length
    ? product.variants.map((variant) => ({
        color: variant.color || "",
        sizes: variant.sizes?.length
          ? variant.sizes.map((size) => ({
              size: size.size || "",
              stock: size.stock ?? 0,
            }))
          : [{ size: "", stock: 0 }],
      }))
    : [createBlankVariant()],
});

const AdminProductForm = ({
  isOpen,
  mode,
  product,
  isSaving,
  onClose,
  onSubmit,
}) => {
  const [formState, setFormState] = useState(createInitialState(product));

  useEffect(() => {
    if (isOpen) {
      setFormState(createInitialState(product));
    }
  }, [isOpen, product]);

  const previewImages = useMemo(
    () => formState.images.map((image) => image.trim()).filter(Boolean),
    [formState.images],
  );

  if (!isOpen) {
    return null;
  }

  const updateField = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateImage = (index, value) => {
    setFormState((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) =>
        imageIndex === index ? value : image,
      ),
    }));
  };

  const addImage = () => {
    setFormState((current) => ({
      ...current,
      images: [...current.images, ""],
    }));
  };

  const removeImage = (index) => {
    setFormState((current) => ({
      ...current,
      images:
        current.images.length === 1
          ? [""]
          : current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const updateVariant = (variantIndex, field, value) => {
    setFormState((current) => ({
      ...current,
      variants: current.variants.map((variant, index) =>
        index === variantIndex ? { ...variant, [field]: value } : variant,
      ),
    }));
  };

  const updateVariantSize = (variantIndex, sizeIndex, field, value) => {
    setFormState((current) => ({
      ...current,
      variants: current.variants.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              sizes: variant.sizes.map((sizeEntry, currentSizeIndex) =>
                currentSizeIndex === sizeIndex
                  ? {
                      ...sizeEntry,
                      [field]: field === "stock" ? Number(value) : value,
                    }
                  : sizeEntry,
              ),
            }
          : variant,
      ),
    }));
  };

  const addVariant = () => {
    setFormState((current) => ({
      ...current,
      variants: [...current.variants, createBlankVariant()],
    }));
  };

  const removeVariant = (variantIndex) => {
    setFormState((current) => ({
      ...current,
      variants:
        current.variants.length === 1
          ? [createBlankVariant()]
          : current.variants.filter((_, index) => index !== variantIndex),
    }));
  };

  const addVariantSize = (variantIndex) => {
    setFormState((current) => ({
      ...current,
      variants: current.variants.map((variant, index) =>
        index === variantIndex
          ? { ...variant, sizes: [...variant.sizes, { size: "", stock: 0 }] }
          : variant,
      ),
    }));
  };

  const removeVariantSize = (variantIndex, sizeIndex) => {
    setFormState((current) => ({
      ...current,
      variants: current.variants.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              sizes:
                variant.sizes.length === 1
                  ? [{ size: "", stock: 0 }]
                  : variant.sizes.filter((_, currentSizeIndex) => currentSizeIndex !== sizeIndex),
            }
          : variant,
      ),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...formState,
      price: Number(formState.price),
      discountPrice:
        formState.discountPrice === "" ? undefined : Number(formState.discountPrice),
      images: formState.images.map((image) => image.trim()).filter(Boolean),
      variants: formState.variants
        .map((variant) => ({
          color: variant.color.trim(),
          sizes: variant.sizes
            .map((sizeEntry) => ({
              size: sizeEntry.size.trim(),
              stock: Number(sizeEntry.stock) || 0,
            }))
            .filter((sizeEntry) => sizeEntry.size),
        }))
        .filter((variant) => variant.color && variant.sizes.length),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#11161d]/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/70 bg-[#faf6f0] p-6 shadow-[0_36px_120px_-60px_rgba(0,0,0,0.55)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d7768]">
              Product Editor
            </p>
            <h2 className="mt-2 font-serif text-4xl tracking-[-0.05em] text-[#171312]">
              {mode === "edit" ? "Update product" : "Create product"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ded2c6] bg-white text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171312]">
                Product Name
              </label>
              <input
                type="text"
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171312]">
                Category
              </label>
              <select
                value={formState.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171312]">
                Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formState.price}
                onChange={(event) => updateField("price", event.target.value)}
                className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171312]">
                Discount Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formState.discountPrice}
                onChange={(event) => updateField("discountPrice", event.target.value)}
                className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#171312]">
                Description
              </label>
              <textarea
                value={formState.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows="5"
                className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
                required
              />
            </div>

            <label className="inline-flex items-center gap-3 rounded-2xl border border-[#e3d7cb] bg-white px-4 py-4 text-sm font-semibold text-[#171312]">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) => updateField("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-[#d8c9bb] text-[#171312] focus:ring-[#efc8c3]"
              />
              Product is active in storefront
            </label>
          </div>

          <div className="rounded-[1.6rem] border border-[#eaded1] bg-white/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-[#171312]">Media URLs</p>
                <p className="mt-1 text-sm text-[#746960]">
                  Add one or more image URLs for the product gallery.
                </p>
              </div>

              <button
                type="button"
                onClick={addImage}
                className="inline-flex items-center gap-2 rounded-full border border-[#ddd1c6] bg-white px-4 py-2 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
              >
                <Plus size={16} />
                Add Image
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-3">
                {formState.images.map((image, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="url"
                      value={image}
                      onChange={(event) => updateImage(index, event.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e2d6ca] bg-white text-[#7d7168] transition hover:border-[#efc8c3] hover:text-[#ef5b5b]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {previewImages.length > 0 ? (
                  previewImages.slice(0, 4).map((image) => (
                    <div
                      key={image}
                      className="aspect-square overflow-hidden rounded-[1.2rem] border border-[#eaded1] bg-[#f5eee6]"
                    >
                      <img
                        src={image}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex min-h-[160px] items-center justify-center rounded-[1.2rem] border border-dashed border-[#d8c9bb] text-sm text-[#8a7767]">
                    Image previews appear here
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-[#eaded1] bg-white/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-[#171312]">Variants</p>
                <p className="mt-1 text-sm text-[#746960]">
                  Manage colors, sizes, and available stock.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-2 rounded-full border border-[#ddd1c6] bg-white px-4 py-2 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
              >
                <Plus size={16} />
                Add Variant
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {formState.variants.map((variant, variantIndex) => (
                <div
                  key={variantIndex}
                  className="rounded-[1.4rem] border border-[#eaded1] bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-semibold text-[#171312]">
                        Color
                      </label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(event) =>
                          updateVariant(variantIndex, "color", event.target.value)
                        }
                        placeholder="Black"
                        className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeVariant(variantIndex)}
                      className="mt-7 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e2d6ca] bg-white text-[#7d7168] transition hover:border-[#efc8c3] hover:text-[#ef5b5b]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {variant.sizes.map((sizeEntry, sizeIndex) => (
                      <div key={sizeIndex} className="grid gap-3 md:grid-cols-[1fr_160px_52px]">
                        <input
                          type="text"
                          value={sizeEntry.size}
                          onChange={(event) =>
                            updateVariantSize(
                              variantIndex,
                              sizeIndex,
                              "size",
                              event.target.value,
                            )
                          }
                          placeholder="M"
                          className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
                        />
                        <input
                          type="number"
                          min="0"
                          value={sizeEntry.stock}
                          onChange={(event) =>
                            updateVariantSize(
                              variantIndex,
                              sizeIndex,
                              "stock",
                              event.target.value,
                            )
                          }
                          placeholder="Stock"
                          className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantSize(variantIndex, sizeIndex)}
                          className="flex h-12 w-full items-center justify-center rounded-2xl border border-[#e2d6ca] bg-white text-[#7d7168] transition hover:border-[#efc8c3] hover:text-[#ef5b5b]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addVariantSize(variantIndex)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#ddd1c6] bg-white px-4 py-2 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
                  >
                    <Plus size={15} />
                    Add Size
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#ddd1c6] bg-white px-6 py-3 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-[#171312] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
            >
              {isSaving
                ? mode === "edit"
                  ? "Saving changes..."
                  : "Creating product..."
                : mode === "edit"
                  ? "Save Changes"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;

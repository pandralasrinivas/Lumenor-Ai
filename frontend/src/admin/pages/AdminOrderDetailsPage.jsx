import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import { adminAPI } from "../../utils/api";
import { formatINR } from "../../utils/productPresentation";

const AdminOrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [formState, setFormState] = useState({
    status: "confirmed",
    paymentStatus: "completed",
    trackingNumber: "",
    estimatedDelivery: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    void (async () => {
      setIsLoading(true);

      try {
        const response = await adminAPI.getOrderById(id);
        const nextOrder = response.data.order;
        setOrder(nextOrder);
        setFormState({
          status: nextOrder.status || "confirmed",
          paymentStatus: nextOrder.paymentStatus || "completed",
          trackingNumber: nextOrder.trackingNumber || "",
          estimatedDelivery: nextOrder.estimatedDelivery
            ? new Date(nextOrder.estimatedDelivery).toISOString().slice(0, 10)
            : "",
        });
      } catch (error) {
        toast.error("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, reloadKey]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await adminAPI.updateOrderStatus(id, {
        ...formState,
        estimatedDelivery: formState.estimatedDelivery || undefined,
      });
      toast.success("Order updated successfully");
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 animate-pulse rounded-[2rem] bg-white/70 shadow-[0_20px_70px_-58px_rgba(61,39,24,0.24)]" />
    );
  }

  if (!order) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[#d9ccc1] bg-white/86 px-6 py-14 text-center text-[#746960]">
        Order not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/store/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#171312] transition hover:text-[#ef5b5b]"
      >
        <ArrowLeft size={15} />
        Back to orders
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-white/75 bg-white/86 p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.38)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7767]">
            Order Details
          </p>
          <h2 className="mt-2 font-serif text-4xl tracking-[-0.05em] text-[#171312]">
            {order.orderNumber}
          </h2>
          <p className="mt-3 text-sm text-[#746960]">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] bg-[#fffdfa] p-4">
              <p className="text-sm uppercase tracking-[0.18em] text-[#8a7767]">
                Customer
              </p>
              <p className="mt-2 text-lg font-semibold text-[#171312]">
                {order.user?.firstName} {order.user?.lastName}
              </p>
              <p className="mt-1 text-sm text-[#746960]">{order.user?.email}</p>
              <p className="mt-1 text-sm text-[#746960]">{order.user?.phone || "-"}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[#fffdfa] p-4">
              <p className="text-sm uppercase tracking-[0.18em] text-[#8a7767]">
                Shipping Address
              </p>
              <p className="mt-2 text-sm leading-7 text-[#171312]">
                {order.shippingAddress?.fullName}
                <br />
                {order.shippingAddress?.street}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.postalCode}
                <br />
                {order.shippingAddress?.country}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.4rem] bg-[#fffdfa] p-4">
            <p className="text-sm uppercase tracking-[0.18em] text-[#8a7767]">
              Items
            </p>
            <div className="mt-4 space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={`${item.product?._id || index}-${index}`}
                  className="flex items-center justify-between gap-4 border-b border-[#f1e7dc] pb-4 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-[#171312]">
                      {item.product?.name || "Product"}
                    </p>
                    <p className="mt-1 text-sm text-[#746960]">
                      {item.selectedColor || "-"} / {item.selectedSize || "-"} · Qty{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-[#171312]">
                    {formatINR(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/75 bg-white/86 p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.38)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7767]">
            Update Status
          </p>
          <h2 className="mt-2 font-serif text-4xl tracking-[-0.05em] text-[#171312]">
            Fulfillment controls
          </h2>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171312]">
                Order Status
              </label>
              <select
                value={formState.status}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, status: event.target.value }))
                }
                className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
              >
                {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171312]">
                Payment Status
              </label>
              <select
                value={formState.paymentStatus}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    paymentStatus: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
              >
                {["pending", "completed", "failed"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171312]">
                Tracking Number
              </label>
              <input
                type="text"
                value={formState.trackingNumber}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    trackingNumber: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171312]">
                Estimated Delivery
              </label>
              <input
                type="date"
                value={formState.estimatedDelivery}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    estimatedDelivery: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
              />
            </div>
          </div>

          <div className="mt-6 rounded-[1.4rem] bg-[#fffdfa] p-4 text-sm text-[#746960]">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#171312]">
                {formatINR(order.subtotalAmount)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Discount</span>
              <span className="font-semibold text-[#171312]">
                -{formatINR(order.discountAmount)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-[#171312]">
                {formatINR(order.shippingCost)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>GST</span>
              <span className="font-semibold text-[#171312]">
                {formatINR(order.taxAmount)}
              </span>
            </div>
            <div className="mt-3 border-t border-[#f1e7dc] pt-3 flex items-center justify-between">
              <span className="text-base font-semibold text-[#171312]">Total</span>
              <span className="text-2xl font-semibold text-[#171312]">
                {formatINR(order.totalAmount)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#171312] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Order Changes"}
          </button>
        </section>
      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;

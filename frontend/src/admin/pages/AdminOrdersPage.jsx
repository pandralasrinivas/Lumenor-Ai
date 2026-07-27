import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, RefreshCcw, Search } from "lucide-react";
import { adminAPI } from "../../utils/api";

const statusOptions = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];
const paymentOptions = ["all", "pending", "completed", "failed"];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const loadOrders = async () => {
        setIsLoading(true);

        try {
          const params = {
            page: 1,
            limit: 50,
          };

          if (search.trim()) {
            params.search = search.trim();
          }

          if (status !== "all") {
            params.status = status;
          }

          if (paymentStatus !== "all") {
            params.paymentStatus = paymentStatus;
          }

          const response = await adminAPI.getOrders(params);
          setOrders(response.data.orders || []);
        } catch (error) {
          toast.error("Failed to load orders");
        } finally {
          setIsLoading(false);
        }
      };

      loadOrders();
    }, 250);

    return () => clearTimeout(timer);
  }, [paymentStatus, reloadKey, search, status]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/75 bg-white/86 p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.38)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7767]">
              Fulfillment
            </p>
            <h2 className="mt-2 font-serif text-4xl tracking-[-0.05em] text-[#171312]">
              Orders management
            </h2>
            <p className="mt-3 text-base text-[#746960]">
              Review orders, inspect customer details, and update fulfillment status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            className="inline-flex items-center gap-2 rounded-full border border-[#ddd1c6] bg-white px-4 py-3 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
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
              placeholder="Search by order number"
              className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-12 py-3 text-[#171312] outline-none transition placeholder:text-[#9b8f87] focus:border-[#efc9c3]"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
          >
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All Status" : item}
              </option>
            ))}
          </select>

          <select
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value)}
            className="rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
          >
            {paymentOptions.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All Payments" : item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/75 bg-white/86 p-4 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.38)] sm:p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-[1.6rem] bg-[#f3ebe3]"
              />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-[1.6rem] border border-[#eaded1] bg-[#fffdfa] p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-[#171312]">
                        {order.orderNumber}
                      </h3>
                      <span className="rounded-full bg-[#fbf5ef] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7767]">
                        {order.status}
                      </span>
                      <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#315daa]">
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#746960]">
                      {order.user?.firstName} {order.user?.lastName} · {order.user?.email}
                    </p>
                    <p className="mt-2 text-sm text-[#746960]">
                      {order.items?.length || 0} items ·{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-2xl font-semibold text-[#171312]">
                      ${Number(order.totalAmount || 0).toFixed(2)}
                    </p>
                    <Link
                      to={`/store/admin/orders/${order._id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[#171312] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ef5b5b]"
                    >
                      Open
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-[#d9ccc1] bg-[#fffdfa] px-6 py-14 text-center text-[#746960]">
            No orders match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;

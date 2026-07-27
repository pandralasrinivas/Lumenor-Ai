import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, ArrowRight, Boxes, IndianRupee, Users } from "lucide-react";
import { adminAPI } from "../../utils/api";
import { formatINR } from "../../utils/productPresentation";

const stats = [
  { key: "productCount", label: "Products", icon: Boxes },
  { key: "orderCount", label: "Orders", icon: Boxes },
  { key: "userCount", label: "Customers", icon: Users },
  { key: "totalRevenue", label: "Revenue", icon: IndianRupee },
];

const StatCard = ({ label, value, icon: Icon, formatValue }) => (
  <div className="rounded-[1.8rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_-58px_rgba(61,39,24,0.36)]">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a7767]">
          {label}
        </p>
        <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#171312]">
          {formatValue ? formatValue(value) : value}
        </p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171312] text-white">
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [overviewResponse, lowStockResponse, ordersResponse] = await Promise.all([
          adminAPI.getOverview(),
          adminAPI.getLowStockProducts(),
          adminAPI.getOrders({ limit: 5 }),
        ]);

        setOverview(overviewResponse.data.overview);
        setLowStock(lowStockResponse.data.products || []);
        setRecentOrders(ordersResponse.data.orders || []);
      } catch (error) {
        toast.error("Failed to load admin dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[1.8rem] bg-white/70 shadow-[0_20px_70px_-58px_rgba(61,39,24,0.24)]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={overview?.[item.key] || 0}
            icon={item.icon}
            formatValue={
              item.key === "totalRevenue"
                ? (value) => formatINR(value)
                : undefined
            }
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-white/75 bg-white/86 p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.38)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7767]">
                Inventory Alerts
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.05em] text-[#171312]">
                Low stock watch
              </h2>
            </div>
            <Link
              to="/store/admin/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#171312] transition hover:text-[#ef5b5b]"
            >
              Manage Products
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {lowStock.length > 0 ? (
              lowStock.slice(0, 6).map((item) => (
                <div
                  key={`${item._id}-${item.color}-${item.size}`}
                  className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-[#eaded1] bg-[#fffdfa] px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1ee] text-[#ef5b5b]">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#171312]">{item.name}</p>
                      <p className="mt-1 text-sm text-[#746960]">
                        {item.category} · {item.color} / {item.size}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#fff1ee] px-3 py-1 text-sm font-semibold text-[#ef5b5b]">
                    {item.stock} left
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-[#d9ccc1] bg-[#fffdfa] px-5 py-8 text-center text-[#746960]">
                No low-stock alerts right now.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/75 bg-white/86 p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.38)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7767]">
                Fulfillment
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.05em] text-[#171312]">
                Recent orders
              </h2>
            </div>
            <Link
              to="/store/admin/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#171312] transition hover:text-[#ef5b5b]"
            >
              Manage Orders
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/store/admin/orders/${order._id}`}
                  className="block rounded-[1.35rem] border border-[#eaded1] bg-[#fffdfa] px-4 py-4 transition hover:border-[#efc8c3] hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#171312]">{order.orderNumber}</p>
                      <p className="mt-1 text-sm text-[#746960]">
                        {order.user?.firstName} {order.user?.lastName} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#171312]">
                        {formatINR(order.totalAmount)}
                      </p>
                      <p className="mt-1 text-sm capitalize text-[#746960]">
                        {order.status}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-[#d9ccc1] bg-[#fffdfa] px-5 py-8 text-center text-[#746960]">
                No orders to show yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

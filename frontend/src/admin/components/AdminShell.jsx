import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Shield,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authSlice";
import { clearCart } from "../../redux/cartSlice";

const navItems = [
  {
    label: "Dashboard",
    to: "/store/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    to: "/store/admin/products",
    icon: Boxes,
  },
  {
    label: "Orders",
    to: "/store/admin/orders",
    icon: ClipboardList,
  },
];

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? "bg-white text-[#11161d] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]"
      : "text-white/72 hover:bg-white/8 hover:text-white"
  }`;

const AdminShell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/store/admin/login");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f1ea_0%,#f1ebe2_100%)] text-[#171312]">
      <div className="grid min-h-screen xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="bg-[#11161d] px-5 py-6 text-white xl:px-6">
          <div className="sticky top-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#11161d]">
                  <Shield size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                    Store Admin
                  </p>
                  <p className="mt-1 text-xl font-semibold text-white">
                    StyleUp Control
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.4rem] bg-white/8 px-4 py-4">
                <p className="text-sm text-white/55">Signed in as</p>
                <p className="mt-1 text-base font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="mt-1 text-sm text-white/55">{user?.email}</p>
              </div>

              <nav className="mt-6 grid gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink key={item.to} to={item.to} className={navClass}>
                      <Icon size={18} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 px-4 py-3 text-sm font-semibold text-white/78 transition hover:bg-white/8 hover:text-white"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-black/6 bg-white/72 px-4 py-4 backdrop-blur xl:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7767]">
                  Admin Workspace
                </p>
                <h1 className="mt-2 font-serif text-4xl tracking-[-0.05em] text-[#171312]">
                  Manage your storefront
                </h1>
              </div>

              <NavLink
                to="/shop"
                className="rounded-full border border-[#ddd1c6] bg-white px-4 py-2 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff7f2]"
              >
                View Store
              </NavLink>
            </div>
          </header>

          <main className="px-4 py-6 xl:px-8 xl:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminShell;

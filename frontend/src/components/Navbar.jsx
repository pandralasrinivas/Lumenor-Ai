import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Gift,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { logout } from "../redux/authSlice";
import { clearCart } from "../redux/cartSlice";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/#collections" },
  { label: "New Arrivals", href: "/#new-arrivals" },
  { label: "Sale", href: "/#sale-picks" },
  { label: "About Us", href: "/#story" },
  { label: "Contact", href: "/#footer" },
];

const shellClass = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8";
const logoClass = "font-serif text-4xl leading-none tracking-[-0.06em]";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const syncScrollState = () => {
      setIsScrolled(window.scrollY > 18);
    };

    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncScrollState);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/");
    setIsOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const nextSearch = searchValue.trim();
    const query = new URLSearchParams();

    if (nextSearch) {
      query.set("search", nextSearch);
    }

    navigate({
      pathname: "/shop",
      search: query.toString() ? `?${query.toString()}` : "",
    });
    setIsOpen(false);
  };

  const isActiveLink = (href) => {
    if (href === "/") {
      return location.pathname === "/" && !location.hash;
    }

    if (href === "/shop") {
      return location.pathname === "/shop";
    }

    return location.pathname === "/" && location.hash === href.replace("/", "");
  };

  return (
    <>
      <div className="bg-[#111111] text-white">
        <div
          className={`${shellClass} flex items-center justify-center gap-2 py-2 text-center text-xs font-semibold tracking-[0.18em] sm:text-sm`}
        >
          <Gift size={14} />
          <span>
            GET 20% OFF ON YOUR FIRST ORDER. USE CODE:
            <span className="ml-2 text-[#ef5b5b]">WELCOME20</span>
          </span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[rgba(255,250,244,0.94)] shadow-[0_18px_40px_-34px_rgba(48,28,18,0.45)] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className={`${shellClass} ${isScrolled ? "py-0" : "py-4"}`}>
          <div
            className={`transition-all duration-300 ${
              isScrolled
                ? "rounded-none border-b border-black/5 bg-transparent shadow-none"
                : "rounded-[1.75rem] border border-white/70 bg-white/[0.85] shadow-[0_28px_80px_-52px_rgba(64,38,22,0.45)]"
            }`}
          >
            <div
              className={`flex items-center gap-4 transition-all duration-300 ${
                isScrolled ? "px-0 py-3 lg:px-2" : "px-5 py-4 lg:px-8"
              }`}
            >
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-end gap-1 text-left"
              >
                <span className={`${logoClass} text-[#171312]`}>
                  Style
                </span>
                <span className={`${logoClass} text-[#ef5b5b]`}>
                  Up.
                </span>
              </button>

              <nav className="hidden min-[1120px]:flex items-center gap-7 text-sm font-semibold text-[#564b45]">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`transition hover:text-[#171312] ${
                      isActiveLink(link.href)
                        ? "text-[#ef5b5b]"
                        : "text-[#564b45]"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <form
                onSubmit={handleSearchSubmit}
                className="ml-auto hidden items-center gap-3 rounded-full border border-[#ece2d7] bg-[#fbf8f4] px-4 py-3 xl:flex xl:w-[320px]"
              >
                <Search size={18} className="text-[#8b7f77]" />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search for products..."
                  className="w-full border-none bg-transparent p-0 text-sm text-[#171312] placeholder:text-[#9b9088] focus:outline-none focus:ring-0"
                />
              </form>

              <div className="ml-auto flex items-center gap-2 xl:ml-0">
                <button
                  type="button"
                  onClick={() => navigate(user ? "/profile" : "/login")}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-[#171312] transition hover:border-[#eadfd3] hover:bg-[#fff7f2]"
                >
                  <User size={20} />
                </button>

                <a
                  href="/#sale-picks"
                  className="hidden h-11 w-11 items-center justify-center rounded-full border border-transparent text-[#171312] transition hover:border-[#eadfd3] hover:bg-[#fff7f2] sm:flex"
                >
                  <Heart size={20} />
                </a>

                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-[#171312] transition hover:border-[#eadfd3] hover:bg-[#fff7f2]"
                >
                  <ShoppingBag size={20} />
                  {items.length > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#ef5b5b] text-[10px] font-bold text-white">
                      {items.length}
                    </span>
                  )}
                </button>

                {user && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="hidden items-center gap-2 rounded-full border border-[#ece2d7] px-4 py-2 text-sm font-semibold text-[#171312] transition hover:border-[#efc8c3] hover:bg-[#fff3f0] lg:flex"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen((current) => !current)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ece2d7] text-[#171312] min-[1120px]:hidden"
                >
                  {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {isOpen && (
              <div
                className={`min-[1120px]:hidden ${
                  isScrolled
                    ? "border-t border-black/5 bg-[rgba(255,250,244,0.98)] px-0 pb-5 pt-4"
                    : "border-t border-[#f1e8df] px-5 pb-5 pt-4"
                }`}
              >
                <form
                  onSubmit={handleSearchSubmit}
                  className={`mb-4 flex items-center gap-3 rounded-full border border-[#ece2d7] bg-[#fbf8f4] px-4 py-3 ${
                    isScrolled ? "mx-4 sm:mx-6" : ""
                  }`}
                >
                  <Search size={18} className="text-[#8b7f77]" />
                  <input
                    type="search"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search for products..."
                    className="w-full border-none bg-transparent p-0 text-sm text-[#171312] placeholder:text-[#9b9088] focus:outline-none focus:ring-0"
                  />
                </form>

                <div
                  className={`grid gap-3 text-sm font-semibold text-[#564b45] ${
                    isScrolled ? "px-4 sm:px-6" : ""
                  }`}
                >
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`rounded-2xl px-4 py-3 transition hover:bg-[#f5eee7] hover:text-[#171312] ${
                        isActiveLink(link.href)
                          ? "bg-[#fff1ee] text-[#ef5b5b]"
                          : "bg-[#fbf7f3]"
                      }`}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                {!user && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/login");
                      setIsOpen(false);
                    }}
                    className={`mt-4 w-full rounded-full bg-[#171312] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] ${
                      isScrolled
                        ? "mx-4 w-[calc(100%-2rem)] sm:mx-6 sm:w-[calc(100%-3rem)]"
                        : ""
                    }`}
                  >
                    Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;

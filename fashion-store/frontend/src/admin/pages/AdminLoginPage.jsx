import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { authAPI } from "../../utils/api";
import { logout, setToken, setUser } from "../../redux/authSlice";

const inputClass =
  "w-full rounded-2xl border border-[#d6c3b4] bg-[#fffaf5] px-4 py-3 pr-12 text-base text-[#171312] outline-none transition placeholder:text-[#8f8278] focus:border-[#c9a48f] focus:bg-white";

const inputStyle = {
  WebkitTextFillColor: "#171312",
  caretColor: "#171312",
};

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fromPath = location.state?.from?.pathname || "/store/admin/dashboard";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      if (response.data.user?.role !== "admin") {
        dispatch(logout());
        toast.error("This account does not have admin access");
        return;
      }

      dispatch(setUser(response.data.user));
      dispatch(setToken(response.data.token));
      toast.success("Admin login successful");
      navigate(fromPath, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(54,63,74,0.7),transparent_28%),radial-gradient(circle_at_80%_14%,rgba(183,145,121,0.28),transparent_22%),linear-gradient(180deg,#0d1117_0%,#121821_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1450px] gap-6 ">
        <section className="flex items-center justify-center rounded-[2.4rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] p-6  sm:p-8">
          <div className="w-full max-w-[620px] rounded-[1rem] bg-[#121821]/92 p-8  sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c7a48f]">
              Shop up
            </p>
            <h2 className="mt-4 font-serif text-5xl tracking-[-0.05em] text-white">
              Admin Sign In
            </h2>
            <p className="mt-4 text-base leading-8 text-white/62">
              This login is reserved for admin accounts configured in your
              system.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/78">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClass}
                    placeholder="admin@yourstore.com"
                    style={inputStyle}
                    required
                  />
                  <Mail
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8278]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/78">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClass}
                    placeholder="Enter admin password"
                    style={inputStyle}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f8278] transition hover:text-[#171312]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#c7a48f] px-6 py-4 text-base font-semibold text-[#11161d] transition hover:bg-[#d3b6a4] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <Lock size={18} />
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-sm text-white/48">
              Need storefront access instead? Use the regular customer pages at{" "}
              <Link to="/login" className="text-[#c7a48f] hover:text-[#d3b6a4]">
                /login
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLoginPage;

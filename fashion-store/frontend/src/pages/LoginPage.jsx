import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail } from "lucide-react";
import { authAPI } from "../utils/api";
import { setToken, setUser } from "../redux/authSlice";
import AuthLayout from "../components/AuthLayout";

const inputClass =
  "w-full rounded-[1.15rem] border border-[#e4d8cc] bg-white px-5 py-4 pr-14 text-base text-[#171312] outline-none transition placeholder:text-[#9f938a] focus:border-[#efc8c3]";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      dispatch(setUser(response.data.user));
      dispatch(setToken(response.data.token));

      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="login"
      title="Welcome Back!"
      subtitle="Log in to continue shopping"
      footerPrompt="Don't have an account?"
      footerActionLabel="Register"
      footerActionTo="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-3 block text-base font-medium text-[#171312]">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              placeholder="Enter your email"
              required
            />
            <Mail
              size={20}
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#9f938a]"
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-base font-medium text-[#171312]">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9f938a] transition hover:text-[#171312]"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-base text-[#5f5550] sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-3">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-[#d8c9bb] text-[#171312] focus:ring-[#efc8c3]"
            />
            Remember me
          </label>

          <button
            type="button"
            onClick={() => toast("Password reset can be added next")}
            className="font-semibold text-[#ef5b5b] transition hover:text-[#d94d4d]"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-[1.15rem] bg-[#171312] px-6 py-4 text-xl font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#7b7068]">
        Prefer a faster start? Browse the{" "}
        <Link to="/shop" className="font-semibold text-[#171312] underline-offset-4 hover:underline">
          latest arrivals
        </Link>{" "}
        first and sign in at checkout.
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

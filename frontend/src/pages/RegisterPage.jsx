import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Phone, User } from "lucide-react";
import { authAPI } from "../utils/api";
import { setToken, setUser } from "../redux/authSlice";
import AuthLayout from "../components/AuthLayout";

const inputClass =
  "w-full rounded-[1.15rem] border border-[#e4d8cc] bg-white px-5 py-4 pr-14 text-base text-[#171312] outline-none transition placeholder:text-[#9f938a] focus:border-[#efc8c3]";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      dispatch(setUser(response.data.user));
      dispatch(setToken(response.data.token));

      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="register"
      title="Create Your Account"
      subtitle="Join StyleUp to save favorites, track orders, and unlock tailored recommendations"
      footerPrompt="Already have an account?"
      footerActionLabel="Log In"
      footerActionTo="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-3 block text-base font-medium text-[#171312]">
              First Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={inputClass}
                placeholder="First name"
                required
              />
              <User
                size={20}
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#9f938a]"
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-base font-medium text-[#171312]">
              Last Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Last name"
                required
              />
              <User
                size={20}
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#9f938a]"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-3 block text-base font-medium text-[#171312]">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
              Phone
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter your phone"
              />
              <Phone
                size={20}
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#9f938a]"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-3 block text-base font-medium text-[#171312]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="Create password"
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

          <div>
            <label className="mb-3 block text-base font-medium text-[#171312]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClass}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9f938a] transition hover:text-[#171312]"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[1.15rem] bg-[#fbf5ef] px-5 py-4 text-sm leading-7 text-[#6f635b]">
          By creating an account, you can save your wishlist, track your
          orders, and enjoy a faster checkout next time.
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-[1.15rem] bg-[#171312] px-6 py-4 text-xl font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
        >
          {isLoading ? "Creating account..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;

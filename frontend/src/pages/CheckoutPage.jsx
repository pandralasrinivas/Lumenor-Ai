import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Lock,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import { addressAPI, cartAPI, orderAPI } from "../utils/api";
import { clearCart, setCart } from "../redux/cartSlice";

const sectionShell = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8";
const FREE_SHIPPING_THRESHOLD = 99;
const STANDARD_SHIPPING_COST = 5.99;
const EXPRESS_SHIPPING_COST = 12.99;
const ESTIMATED_TAX_RATE = 0.0865;

const shippingOptions = [
  {
    id: "standard_shipping",
    title: "Standard Shipping",
    eta: "5-7 Business Days",
    price: STANDARD_SHIPPING_COST,
  },
  {
    id: "express_shipping",
    title: "Express Shipping",
    eta: "2-3 Business Days",
    price: EXPRESS_SHIPPING_COST,
  },
];

const paymentOptions = [
  {
    id: "credit_debit_card",
    title: "Credit / Debit Card",
    badges: ["VISA", "MC", "AMEX"],
  },
  {
    id: "paypal",
    title: "PayPal",
    badges: ["PayPal"],
  },
  {
    id: "stripe",
    title: "Stripe",
    badges: ["stripe"],
  },
  {
    id: "cash_on_delivery",
    title: "Cash on Delivery",
    badges: ["COD"],
  },
];

const perkItems = [
  {
    icon: Truck,
    title: "Free Shipping",
    copy: "On orders over $99",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    copy: "Easy returns & exchanges",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    copy: "100% secure checkout",
  },
];

const initialAddressForm = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "USA",
  isDefault: false,
};

const initialCardForm = {
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  cardholderName: "",
};

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const CheckoutPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    "credit_debit_card",
  );
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(
    "standard_shipping",
  );
  const [couponCode, setCouponCode] = useState("");
  const [cardForm, setCardForm] = useState(initialCardForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, totalPrice, discountAmount, discountCode } = useSelector(
    (state) => state.cart,
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCheckoutData = async () => {
      try {
        const [addressResponse, cartResponse] = await Promise.all([
          addressAPI.getAll(),
          cartAPI.get(),
        ]);

        const nextAddresses = addressResponse.data.addresses || [];
        const defaultAddress =
          nextAddresses.find((address) => address.isDefault) || nextAddresses[0];

        setAddresses(nextAddresses);
        setSelectedAddressId(defaultAddress?._id || "");
        dispatch(setCart(cartResponse.data.cart));
      } catch (error) {
        toast.error("Failed to load checkout");
      }
    };

    fetchCheckoutData();
  }, [dispatch, navigate, user]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const discountedSubtotal = Math.max(totalPrice - discountAmount, 0);
  const shippingCost =
    selectedShippingMethod === "express_shipping"
      ? EXPRESS_SHIPPING_COST
      : discountedSubtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : STANDARD_SHIPPING_COST;
  const estimatedTax = items.length
    ? Number(((discountedSubtotal + shippingCost) * ESTIMATED_TAX_RATE).toFixed(2))
    : 0;
  const orderTotal = discountedSubtotal + shippingCost + estimatedTax;

  const resetAddressForm = () => {
    setAddressForm({
      ...initialAddressForm,
      isDefault: addresses.length === 0,
    });
    setEditingAddressId(null);
  };

  const openNewAddressForm = () => {
    resetAddressForm();
    setIsAddressFormOpen(true);
  };

  const openEditAddressForm = (address) => {
    setAddressForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "",
      isDefault: Boolean(address.isDefault),
    });
    setEditingAddressId(address._id);
    setIsAddressFormOpen(true);
  };

  const handleAddressFieldChange = (field, value) => {
    setAddressForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();
    setIsSavingAddress(true);

    try {
      const payload = {
        ...addressForm,
        isDefault: Boolean(addressForm.isDefault),
      };
      let response;

      if (editingAddressId) {
        response = await addressAPI.update(editingAddressId, payload);
        setAddresses((current) =>
          current.map((address) =>
            address._id === editingAddressId ? response.data.address : address,
          ),
        );
      } else {
        response = await addressAPI.create(payload);
        setAddresses((current) => [...current, response.data.address]);
      }

      if (payload.isDefault) {
        setAddresses((current) =>
          current.map((address) => ({
            ...address,
            isDefault: address._id === response.data.address._id,
          })),
        );
      }

      setSelectedAddressId(response.data.address._id);
      setIsAddressFormOpen(false);
      resetAddressForm();
      toast.success(
        editingAddressId ? "Address updated successfully" : "Address added successfully",
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    setDeletingAddressId(addressId);

    try {
      await addressAPI.delete(addressId);
      const nextAddresses = addresses.filter((address) => address._id !== addressId);
      const fallbackAddress =
        nextAddresses.find((address) => address.isDefault) || nextAddresses[0];

      setAddresses(nextAddresses);
      setSelectedAddressId((current) =>
        current === addressId ? fallbackAddress?._id || "" : current,
      );

      if (editingAddressId === addressId) {
        setIsAddressFormOpen(false);
        resetAddressForm();
      }

      toast.success("Address deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete address");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const response = await cartAPI.applyCoupon({ couponCode });
      dispatch(setCart(response.data.cart));
      toast.success("Coupon applied successfully");
      setCouponCode("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const validateCardFields = () => {
    if (selectedPaymentMethod !== "credit_debit_card") {
      return true;
    }

    if (
      cardForm.cardNumber.replace(/\s+/g, "").length < 12 ||
      !cardForm.expiryDate.trim() ||
      cardForm.cvv.trim().length < 3 ||
      !cardForm.cardholderName.trim()
    ) {
      toast.error("Please complete your card details");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!validateCardFields()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await orderAPI.create({
        shippingAddressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
        shippingMethod: selectedShippingMethod,
      });

      dispatch(clearCart());
      toast.success("Order placed successfully!");
      navigate(`/order/${response.data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className={`${sectionShell} py-16`}>
        <div className="rounded-[2rem] border border-dashed border-[#dfd0c2] bg-white/[0.82] px-8 py-20 text-center shadow-[0_18px_60px_-56px_rgba(63,40,24,0.45)]">
          <h1 className="font-serif text-5xl tracking-[-0.05em] text-[#171312]">
            Your cart is empty
          </h1>
          <p className="mt-4 text-base leading-7 text-[#7a6e65]">
            Add products to your cart before continuing to checkout.
          </p>
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="mt-8 rounded-full bg-[#171312] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sectionShell} py-8 sm:py-10`}>
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#7a6e65]">
        <Link to="/" className="transition hover:text-[#171312]">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link to="/cart" className="transition hover:text-[#171312]">
          Cart
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#171312]">Checkout</span>
      </div>

      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-serif text-5xl tracking-[-0.05em] text-[#171312] sm:text-6xl">
            Checkout
          </h1>
          <p className="mt-3 text-base text-[#6f635b]">
            Please fill in the details and complete your order
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 rounded-[1.5rem] border border-white/70 bg-white/[0.78] px-5 py-4 shadow-[0_18px_50px_-44px_rgba(61,39,24,0.36)]">
          {[
            { step: 1, label: "Cart", active: true },
            { step: 2, label: "Shipping", active: true },
            { step: 3, label: "Payment", active: true },
            { step: 4, label: "Review", active: true },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div
                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  item.active
                    ? "bg-[#171312] text-white"
                    : "border border-[#ded2c6] bg-white text-[#171312]"
                }`}
              >
                {item.step}
              </div>
              <p className="mt-2 text-sm font-medium text-[#4f4540]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.8fr)_360px]">
        <section className="rounded-[2rem] border border-white/75 bg-white/[0.88] p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.42)] sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#171312] text-white">
              <MapPin size={18} />
            </div>
            <h2 className="text-2xl font-semibold text-[#171312]">
              1. Delivery Information
            </h2>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-base font-semibold text-[#171312]">Delivery Address</p>
            <button
              type="button"
              onClick={openNewAddressForm}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f63c6] transition hover:text-[#204b98]"
            >
              <Plus size={16} />
              Add New Address
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {addresses.map((address) => (
              <label
                key={address._id}
                className={`block cursor-pointer rounded-[1.5rem] border p-5 transition ${
                  selectedAddressId === address._id
                    ? "border-[#171312] bg-[#fffdfa] shadow-[0_18px_54px_-48px_rgba(23,19,18,0.4)]"
                    : "border-[#eee2d6] bg-white hover:border-[#dfd2c6]"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      value={address._id}
                      checked={selectedAddressId === address._id}
                      onChange={(event) => setSelectedAddressId(event.target.value)}
                      className="mt-1 h-4 w-4 border-[#d8c9bb] text-[#171312] focus:ring-[#efc8c3]"
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-[#171312]">
                          {address.fullName}
                        </p>
                        {address.isDefault && (
                          <span className="rounded-full bg-[#f7e9c5] px-3 py-1 text-xs font-semibold text-[#9b6a26]">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-1 text-sm leading-7 text-[#6a6059]">
                        <p>{address.phone}</p>
                        <p>
                          {address.street}, {address.city}, {address.state}{" "}
                          {address.postalCode}, {address.country}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-start text-sm">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        openEditAddressForm(address);
                      }}
                      className="inline-flex items-center gap-2 text-[#4f4540] transition hover:text-[#171312]"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        handleDeleteAddress(address._id);
                      }}
                      disabled={deletingAddressId === address._id}
                      className="inline-flex items-center gap-2 text-[#4f4540] transition hover:text-[#ef5b5b] disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deletingAddressId === address._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {isAddressFormOpen && (
            <form
              onSubmit={handleSaveAddress}
              className="mt-6 rounded-[1.75rem] border border-[#eaded1] bg-[#fffdfa] p-5 shadow-[0_16px_48px_-42px_rgba(61,39,24,0.34)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-[#171312]">
                  {editingAddressId ? "Edit Address" : "Add New Address"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddressFormOpen(false);
                    resetAddressForm();
                  }}
                  className="text-sm font-medium text-[#6f635b] transition hover:text-[#171312]"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  { key: "fullName", label: "Full Name", type: "text" },
                  { key: "phone", label: "Phone", type: "tel" },
                  { key: "street", label: "Street Address", type: "text", span: true },
                  { key: "city", label: "City", type: "text" },
                  { key: "state", label: "State", type: "text" },
                  { key: "postalCode", label: "Postal Code", type: "text" },
                  { key: "country", label: "Country", type: "text" },
                ].map((field) => (
                  <div
                    key={field.key}
                    className={field.span ? "md:col-span-2" : undefined}
                  >
                    <label className="mb-2 block text-sm font-medium text-[#171312]">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={addressForm[field.key]}
                      onChange={(event) =>
                        handleAddressFieldChange(field.key, event.target.value)
                      }
                      className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition focus:border-[#efc9c3]"
                      required
                    />
                  </div>
                ))}
              </div>

              <label className="mt-4 flex items-center gap-3 text-sm text-[#4f4540]">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(event) =>
                    handleAddressFieldChange("isDefault", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-[#d8c9bb] text-[#171312] focus:ring-[#efc8c3]"
                />
                Make this my default address
              </label>

              <button
                type="submit"
                disabled={isSavingAddress}
                className="mt-5 rounded-full bg-[#171312] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
              >
                {isSavingAddress
                  ? "Saving..."
                  : editingAddressId
                    ? "Update Address"
                    : "Save Address"}
              </button>
            </form>
          )}

          <div className="mt-8">
            <p className="text-base font-semibold text-[#171312]">Delivery Method</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {shippingOptions.map((option) => {
                const computedPrice =
                  option.id === "standard_shipping" &&
                  discountedSubtotal >= FREE_SHIPPING_THRESHOLD
                    ? 0
                    : option.price;

                return (
                  <label
                    key={option.id}
                    className={`cursor-pointer rounded-[1.5rem] border p-5 transition ${
                      selectedShippingMethod === option.id
                        ? "border-[#171312] bg-[#fffdfa] shadow-[0_18px_54px_-48px_rgba(23,19,18,0.4)]"
                        : "border-[#eee2d6] bg-white hover:border-[#dfd2c6]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={option.id}
                        checked={selectedShippingMethod === option.id}
                        onChange={(event) => setSelectedShippingMethod(event.target.value)}
                        className="mt-1 h-4 w-4 border-[#d8c9bb] text-[#171312] focus:ring-[#efc8c3]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-[#171312]">
                              {option.title}
                            </p>
                            <p className="mt-1 text-sm text-[#6f635b]">{option.eta}</p>
                          </div>
                          <div className="text-right">
                            <Truck size={20} className="ml-auto text-[#171312]" />
                            <p className="mt-2 text-base font-semibold text-[#171312]">
                              {computedPrice === 0 ? "Free" : formatCurrency(computedPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-white/75 bg-white/[0.88] p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.42)] sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#171312] text-white">
                <CreditCard size={18} />
              </div>
              <h2 className="text-2xl font-semibold text-[#171312]">
                2. Payment Method
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {paymentOptions.map((option) => (
                <label
                  key={option.id}
                  className={`block cursor-pointer rounded-[1.4rem] border p-4 transition ${
                    selectedPaymentMethod === option.id
                      ? "border-[#171312] bg-[#fffdfa] shadow-[0_14px_40px_-34px_rgba(23,19,18,0.28)]"
                      : "border-[#eee2d6] bg-white hover:border-[#dfd2c6]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.id}
                        checked={selectedPaymentMethod === option.id}
                        onChange={(event) => setSelectedPaymentMethod(event.target.value)}
                        className="h-4 w-4 border-[#d8c9bb] text-[#171312] focus:ring-[#efc8c3]"
                      />
                      <p className="text-lg font-semibold text-[#171312]">
                        {option.title}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      {option.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full bg-[#f7f3ef] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6f635b]"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {option.id === "credit_debit_card" &&
                    selectedPaymentMethod === "credit_debit_card" && (
                      <div className="mt-5 grid gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#171312]">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardForm.cardNumber}
                            onChange={(event) =>
                              setCardForm((current) => ({
                                ...current,
                                cardNumber: event.target.value,
                              }))
                            }
                            placeholder="1234 5678 9012 3456"
                            className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition placeholder:text-[#9b9088] focus:border-[#efc9c3]"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#171312]">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={cardForm.expiryDate}
                              onChange={(event) =>
                                setCardForm((current) => ({
                                  ...current,
                                  expiryDate: event.target.value,
                                }))
                              }
                              placeholder="MM / YY"
                              className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition placeholder:text-[#9b9088] focus:border-[#efc9c3]"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#171312]">
                              CVV
                            </label>
                            <input
                              type="password"
                              value={cardForm.cvv}
                              onChange={(event) =>
                                setCardForm((current) => ({
                                  ...current,
                                  cvv: event.target.value,
                                }))
                              }
                              placeholder="123"
                              className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition placeholder:text-[#9b9088] focus:border-[#efc9c3]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#171312]">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardForm.cardholderName}
                            onChange={(event) =>
                              setCardForm((current) => ({
                                ...current,
                                cardholderName: event.target.value,
                              }))
                            }
                            placeholder="Name on card"
                            className="w-full rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition placeholder:text-[#9b9088] focus:border-[#efc9c3]"
                          />
                        </div>
                      </div>
                    )}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/75 bg-white/[0.88] p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.42)] sm:p-7">
            <div className="flex items-center gap-2 text-base font-semibold text-[#171312]">
              <Tag size={18} />
              Coupon Code
            </div>

            <div className="mt-4 flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Enter coupon code"
                className="min-w-0 flex-1 rounded-2xl border border-[#ddd1c6] bg-white px-4 py-3 text-[#171312] outline-none transition placeholder:text-[#9b9088] focus:border-[#efc9c3]"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon}
                className="rounded-xl bg-[#171312] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </button>
            </div>

            {discountCode && (
              <div className="mt-4 rounded-[1.25rem] bg-[#edf8ef] px-4 py-4 text-sm text-[#2d9b52]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      Great! You saved {formatCurrency(discountAmount)} with coupon code
                    </p>
                    <p className="mt-1 font-bold uppercase tracking-[0.14em]">
                      {discountCode}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-[2rem] border border-white/75 bg-white/[0.9] p-6 shadow-[0_24px_80px_-62px_rgba(61,39,24,0.42)] sm:p-7 h-fit">
          <h2 className="text-3xl font-semibold text-[#171312]">
            Order Summary ({itemCount} Items)
          </h2>

          <div className="mt-6 max-h-[360px] space-y-4 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item._id} className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#fbf9f5_0%,#efe4d8_100%)]">
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product?.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9c8f84]">
                      Style
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-lg font-semibold text-[#171312]">
                    {item.product?.name}
                  </p>
                  <div className="mt-1 space-y-1 text-sm text-[#6f635b]">
                    {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                    {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                    <p>Qty: {item.quantity}</p>
                  </div>
                </div>

                <p className="text-lg font-semibold text-[#171312]">
                  {formatCurrency(item.priceAtAddition * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 border-t border-[#eee3d7] pt-6 text-base text-[#4f4540]">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#171312]">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-[#2d9b52]">
                <span>Discount {discountCode ? `(${discountCode})` : ""}</span>
                <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-[#171312]">
                {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Estimated Tax</span>
              <span className="font-semibold text-[#171312]">
                {formatCurrency(estimatedTax)}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-[#eee3d7] pt-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-[#171312]">Total</span>
              <span className="text-4xl font-bold text-[#171312]">
                {formatCurrency(orderTotal)}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-[1.25rem] bg-[#edf8ef] px-4 py-4 text-[#2d9b52]">
            <div className="flex items-start gap-3">
              <Lock size={18} className="mt-0.5" />
              <div>
                <p className="font-semibold">Secure Checkout</p>
                <p className="mt-1 text-sm text-[#376f49]">
                  Your information is safe and encrypted
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isLoading || !selectedAddressId}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#171312] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#ef5b5b] disabled:cursor-not-allowed disabled:bg-[#b8aea7]"
          >
            {isLoading ? "Placing Order..." : "Place Order"}
          </button>

          <p className="mt-4 text-center text-sm text-[#7c7067]">
            By placing your order, you agree to our Terms & Conditions
          </p>
        </aside>
      </div>

      <section className="mt-10 grid gap-4 rounded-[2rem] border border-white/75 bg-white/[0.86] p-6 shadow-[0_20px_64px_-58px_rgba(61,39,24,0.34)] sm:grid-cols-3">
        {perkItems.map((perk) => {
          const Icon = perk.icon;

          return (
            <div key={perk.title} className="flex items-start gap-3">
              <div className="mt-1 text-[#171312]">
                <Icon size={22} />
              </div>
              <div>
                <p className="text-base font-semibold text-[#171312]">{perk.title}</p>
                <p className="mt-1 text-sm text-[#746960]">{perk.copy}</p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default CheckoutPage;

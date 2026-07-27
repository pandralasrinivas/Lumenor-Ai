import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { downloadBlobFile, orderAPI } from "../utils/api";
import { formatINR } from "../utils/productPresentation";
import { Download, MapPin, Truck } from "lucide-react";

const statusClasses = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  shipped: "bg-violet-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getById(id);
        setOrder(response.data.order);
      } catch (error) {
        toast.error("Failed to load order details");
        navigate("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, navigate]);

  const handleDownloadInvoice = async () => {
    try {
      const response = await orderAPI.generateInvoice(id);
      downloadBlobFile(response.data, `invoice-${order.orderNumber}.pdf`);
      toast.success("Invoice downloaded");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusClass = statusClasses[order.status] || "bg-gray-500";
  const subtotalAmount =
    order.subtotalAmount ?? Number(order.totalAmount || 0) + Number(order.discountAmount || 0);
  const shippingCost = Number(order.shippingCost || 0);
  const taxAmount = Number(order.taxAmount || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate("/orders")}
          className="mb-6 text-blue-600 hover:underline"
        >
          {"<"} Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Order Number</p>
                  <p className="text-2xl font-bold">{order.orderNumber}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Order Date</p>
                  <p className="text-2xl font-bold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full font-semibold text-white ${statusClass}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Payment Status</p>
                  <p
                    className={`font-semibold ${
                      order.paymentStatus === "completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </p>
                </div>
              </div>
            </div>

            {order.status !== "cancelled" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-4">Delivery Timeline</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <div className="w-1 h-12 bg-green-300"></div>
                    </div>
                    <div>
                      <p className="font-semibold">Order Confirmed</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {order.status === "shipped" ||
                  order.status === "delivered" ? (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div className="w-1 h-12 bg-green-300"></div>
                      </div>
                      <div>
                        <p className="font-semibold">Shipped</p>
                        <p className="text-sm text-gray-600">
                          {new Date(
                            order.shippedAt || order.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <div className="w-1 h-12 bg-gray-300"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-400">
                          In Transit
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p
                        className={`font-semibold ${
                          order.status === "delivered" ? "" : "text-gray-400"
                        }`}
                      >
                        Delivered
                      </p>
                      {order.status === "delivered" && order.deliveredAt && (
                        <p className="text-sm text-gray-600">
                          {new Date(order.deliveredAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 pb-4 border-b last:border-b-0"
                  >
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product?.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{item.product?.name}</p>
                      <p className="text-sm text-gray-600">
                        Color: {item.selectedColor} | Size: {item.selectedSize}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatINR(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatINR(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.shippingAddress && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold mb-2">Shipping Address</h3>
                    <p className="font-semibold">
                      {order.shippingAddress.fullName}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.street}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.country}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-4">Price Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotalAmount)}</span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatINR(order.discountAmount)}</span>
                  </div>
                )}

                {shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatINR(shippingCost)}</span>
                  </div>
                )}

                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>GST</span>
                    <span>{formatINR(taxAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>{formatINR(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadInvoice}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download Invoice
              </button>

              {order.status === "shipped" && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="text-blue-600" size={20} />
                    <p className="font-semibold">In Transit</p>
                  </div>
                  <p className="text-sm text-gray-700">
                    Your order is on its way! Expected delivery:{" "}
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                  {order.trackingNumber && (
                    <p className="text-sm text-gray-700 mt-2">
                      Tracking: {order.trackingNumber}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;

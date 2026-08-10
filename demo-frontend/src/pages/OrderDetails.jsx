import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../services/orderService";
import { getPaymentsByOrderId } from "../services/paymentService";
import { getProductById } from "../services/productService";
import { format } from "date-fns";
import { getProductImageSrc } from "../services/imageService";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const orderData = await getOrderById(id);
        setOrder(orderData);

        // Fetch product
        if (orderData.productId) {
            try {
                const p = await getProductById(orderData.productId);
                setProduct(p.data); 
            } catch (e) {
                console.error("Product fetch error", e);
            }
        }

        // Fetch payments
        const payments = await getPaymentsByOrderId(id);
        if (payments && payments.length > 0) {
          setPayment(payments[0]);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!order) return <div className="p-8 text-center">Order not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.orderId}</h1>
            <p className="text-sm text-gray-500">Placed on {order.orderDate ? format(new Date(order.orderDate), "PPpp") : "N/A"}</p>
          </div>
          <button onClick={() => navigate("/my-orders")} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
            ← Back to Orders
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              order.status === "PLACED" ? "bg-blue-100 text-blue-800" : 
              order.status === "PAID" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}>
              {order.status}
            </span>
          </div>

          {/* Product Details */}
          <div className="bg-gray-50 rounded-2xl p-4 flex gap-4">
            {product && (
              <img
                src={getProductImageSrc(product)}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg bg-white"
              />
            )}
            <div>
                <p className="font-bold text-gray-900">{product ? product.name : `Product ID: ${order.productId}`}</p>
                <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                <p className="font-semibold text-gray-900 mt-1">₹{order.totalAmount}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
              <p className="font-medium text-gray-900">User ID: {order.userId}</p> {/* Explicit ID since name not easily available */}
              <p className="text-gray-600 text-sm">{order.phone}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Mode</h3>
              <p className="font-medium text-gray-900">{payment ? (payment.method === "COD" ? "Cash on Delivery" : "Online Card Payment") : "Unknown"}</p>
              {payment && payment.method === "CARD" && (
                <p className="text-xs text-gray-500">Card ending in {payment.cardLast4}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</h3>
              <p className="text-gray-800">{order.addressLine1}</p>
              {order.addressLine2 && <p className="text-gray-800">{order.addressLine2}</p>}
              <p className="text-gray-800">{order.city}, {order.state} {order.postalCode}</p>
              <p className="text-gray-800">{order.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

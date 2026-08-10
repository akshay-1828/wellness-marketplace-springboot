import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useCart } from "../context/CartContext";
import { getProductImageSrc } from "../services/imageService";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, total, removeFromCart, setQuantity } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cart</h1>
            <p className="mt-1 text-sm text-gray-600">Review your items before checkout.</p>
          </div>
          <Link to="/products" className="text-sm text-emerald-700 hover:underline">
            Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-gray-700">Your cart is empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                        <img
                          src={getProductImageSrc(item)}
                          alt={item.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700">Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => setQuantity(item.productId, e.target.value)}
                        className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      />
                      <Button
                        variant="secondary"
                        className="w-auto px-4 py-2 rounded-xl"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Total</p>
                <p className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="primary"
                  className="w-auto px-5 py-2.5 rounded-xl"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

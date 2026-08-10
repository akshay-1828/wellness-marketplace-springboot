import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";
import { getCurrentUserId } from "../services/userService";
import { getProductImageSrc } from "../services/imageService";
import { chargeCardPayment, createCodPayment } from "../services/paymentService";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");

  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");

  const isEmpty = items.length === 0;

  const orderLines = useMemo(() => {
    return items.map((i) => ({
      productId: i.productId,
      name: i.name,
      unitPrice: Number(i.price) || 0,
      quantity: Number(i.quantity) || 0,
      lineTotal: (Number(i.price) || 0) * (Number(i.quantity) || 0),
    }));
  }, [items]);

  const placeOrder = async () => {
    setError("");
    setIsPlacing(true);

    try {
      const userId = await getCurrentUserId();

      if (!addressLine1.trim()) throw new Error("Address line 1 is required.");
      if (!city.trim()) throw new Error("City is required.");
      if (!stateName.trim()) throw new Error("State is required.");
      if (!postalCode.trim()) throw new Error("Postal code is required.");
      if (!country.trim()) throw new Error("Country is required.");
      if (!phone.trim()) throw new Error("Phone is required.");
      const digitsOnlyPhone = phone.replace(/\D/g, "");
      if (digitsOnlyPhone.length < 10) throw new Error("Phone must be at least 10 digits.");

      if (paymentMethod === "CARD") {
        if (!nameOnCard.trim()) throw new Error("Name on card is required.");
        if (!cardNumber.trim()) throw new Error("Card number is required.");
        if (!expiryMonth.trim() || !expiryYear.trim()) throw new Error("Expiry month/year is required.");
        if (!cvc.trim()) throw new Error("CVC is required.");
      }

      for (const line of orderLines) {
        const created = await createOrder({
          userId,
          productId: line.productId,
          quantity: line.quantity,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || null,
          city: city.trim(),
          state: stateName.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          phone: phone.trim(),
          status: "PLACED",
        });

        const orderId = created?.orderId;
        if (!orderId) {
          throw new Error("Order created but orderId is missing.");
        }

        if (paymentMethod === "COD") {
          await createCodPayment({ orderId });
        } else {
          await chargeCardPayment({
            orderId,
            nameOnCard: nameOnCard.trim(),
            cardNumber: cardNumber.trim(),
            expiryMonth: Number(expiryMonth),
            expiryYear: Number(expiryYear),
            cvc: cvc.trim(),
          });
        }
      }

      clearCart();
      navigate("/my-orders");
    } catch (err) {
      console.error("Checkout error:", err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setError(msg || "Unable to place order.");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="mt-1 text-sm text-gray-600">Place your order securely.</p>
          </div>
          <Link to="/cart" className="text-sm text-emerald-700 hover:underline">
            ← Back to cart
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isEmpty ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-gray-700">Your cart is empty.</p>
            <div className="mt-4">
              <Link to="/products" className="text-sm text-emerald-700 hover:underline">
                Browse products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">Order summary</h2>
              <div className="mt-4 space-y-3">
                {orderLines.map((line) => (
                  <div key={line.productId} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                        <img
                          src={getProductImageSrc({ name: line.name })}
                          alt={line.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{line.name}</p>
                        <p className="text-sm text-gray-600">
                          ₹{line.unitPrice} × {line.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">₹{line.lineTotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700">Total</p>
                <p className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">Delivery address</h2>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800">Address line 1</label>
                  <input
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    placeholder="House no, street, area"
                    disabled={isPlacing}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800">Address line 2 (optional)</label>
                  <input
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    placeholder="Landmark, apartment, etc."
                    disabled={isPlacing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    placeholder="City"
                    disabled={isPlacing}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">State</label>
                  <input
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    placeholder="State"
                    disabled={isPlacing}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">Postal code</label>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    placeholder="Postal code"
                    disabled={isPlacing}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">Country</label>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    placeholder="Country"
                    disabled={isPlacing}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800">Phone number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    placeholder="10-digit phone number"
                    inputMode="tel"
                    disabled={isPlacing}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">Delivery & payment</h2>

              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-100 p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1"
                    disabled={isPlacing}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when the product arrives.</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-100 p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                    className="mt-1"
                    disabled={isPlacing}
                  />
                  <div className="w-full">
                    <p className="font-semibold text-gray-900">Online payment (Card)</p>
                    <p className="text-sm text-gray-600">Secure card payment.</p>

                    {paymentMethod === "CARD" && (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-gray-800">Name on card</label>
                          <input
                            value={nameOnCard}
                            onChange={(e) => setNameOnCard(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                            placeholder="Full name"
                            disabled={isPlacing}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-gray-800">Card number</label>
                          <input
                            value={cardNumber}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length > 16) val = val.slice(0, 16);
                              const parts = val.match(/.{1,4}/g);
                              setCardNumber(parts ? parts.join(" ") : "");
                            }}
                            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                            placeholder="1234 5678 9012 3456"
                            inputMode="numeric"
                            disabled={isPlacing}
                          />
                          <p className="mt-1 text-xs text-gray-500">Use a valid card number (example test card: 4242 4242 4242 4242).</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800">Expiry month</label>
                          <input
                            value={expiryMonth}
                            onChange={(e) => setExpiryMonth(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                            placeholder="MM"
                            inputMode="numeric"
                            disabled={isPlacing}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800">Expiry year</label>
                          <input
                            value={expiryYear}
                            onChange={(e) => setExpiryYear(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                            placeholder="YY or YYYY"
                            inputMode="numeric"
                            disabled={isPlacing}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800">CVC</label>
                          <input
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                            placeholder="123"
                            inputMode="numeric"
                            disabled={isPlacing}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-500">
                            Demo checkout: card payments are simulated; only last 4 digits are stored.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                  className="w-auto px-6 py-2.5 rounded-xl"
                  onClick={placeOrder}
                  disabled={isPlacing}
                  loading={isPlacing}
                >
                  Place order
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

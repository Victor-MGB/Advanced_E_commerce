import { useState } from "react";
import { CreditCard, LockKeyhole, MapPin, PackageCheck, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { money } from "../lib/format.js";
import { useStore } from "../lib/store.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { EmptyState } from "../components/UI.jsx";

function CheckoutContent() {
  const { cart, user, refreshCart, notify } = useStore();
  const navigate = useNavigate();
  const saved = user?.addresses?.[0];
  const [form, setForm] = useState({
    street: saved?.street || "",
    city: saved?.city || "",
    phone: saved?.phone || "",
  });
  const [payment, setPayment] = useState("cash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!cart?.cartItems?.length) {
    return (
      <div className="container py-16">
        <EmptyState icon={PackageCheck} title="Nothing to check out" text="Add a few items to your cart first." to="/shop" />
      </div>
    );
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await api.createOrder({ cartId: cart._id, shippingAddress: form, paymentMethod: payment });
      if (result?.url) {
        window.location.href = result.url;
        return;
      }
      await refreshCart();
      notify("Order placed successfully!");
      navigate("/orders", { state: { placed: true } });
    } catch (exception) {
      setError(exception.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-10 sm:py-14">
      <span className="eyebrow">Final step</span>
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="mt-2 text-sm text-slate-500">Tell us where to deliver and how you'd like to pay.</p>

      <form className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]" onSubmit={placeOrder}>
        <div className="space-y-6">
          <section className="panel">
            <h2 className="flex items-center gap-2"><MapPin size={19} className="text-brand-700" /> Delivery address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field sm:col-span-2">
                <label htmlFor="street">Street address</label>
                <input id="street" required value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} placeholder="House number and street" />
              </div>
              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Abuja" />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <input id="phone" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+234 800 000 0000" />
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>Payment method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPayment("cash")}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${payment === "cash" ? "border-brand-700 bg-brand-50" : "border-slate-200"}`}
              >
                <Wallet size={21} className="text-brand-700" />
                <span><strong className="block text-sm">Cash on delivery</strong><small className="text-slate-500">Pay when it arrives</small></span>
              </button>
              <button
                type="button"
                onClick={() => setPayment("card")}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${payment === "card" ? "border-brand-700 bg-brand-50" : "border-slate-200"}`}
              >
                <CreditCard size={21} className="text-brand-700" />
                <span><strong className="block text-sm">Card / Paystack</strong><small className="text-slate-500">Secure online payment</small></span>
              </button>
            </div>
          </section>
        </div>

        <aside className="panel h-fit lg:sticky lg:top-24">
          <h2>Your order</h2>
          <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
            {cart.cartItems.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <img src={item.product?.imgCover} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{item.product?.title || "Product"}</p>
                  <p className="text-[11px] text-slate-500">Qty {item.quantity}</p>
                </div>
                <strong className="text-xs">{money(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="summary-row"><span>Subtotal</span><strong>{money(cart.totalPrice)}</strong></div>
            {cart.discount > 0 && <div className="summary-row text-brand-700"><span>Coupon</span><strong>−{money(cart.totalPrice - cart.totalPriceAfterDiscount)}</strong></div>}
            <div className="summary-row"><span>Delivery</span><strong>{cart.totalPrice >= 150 ? "Free" : money(12)}</strong></div>
          </div>
          <div className="summary-total"><span>Total</span><strong>{money(cart.totalPriceAfterDiscount ?? cart.totalPrice)}</strong></div>
          {error && <p className="field-error mt-4">{error}</p>}
          <button className="btn btn--primary mt-6 w-full" disabled={busy} type="submit">
            <LockKeyhole size={17} /> {busy ? "Processing…" : payment === "card" ? "Pay securely" : "Place order"}
          </button>
          <p className="mt-3 text-center text-[11px] text-slate-500">Your details are protected end to end.</p>
        </aside>
      </form>
    </div>
  );
}

export default function Checkout() {
  return <ProtectedRoute><CheckoutContent /></ProtectedRoute>;
}

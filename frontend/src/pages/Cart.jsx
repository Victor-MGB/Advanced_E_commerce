import { useState } from "react";
import { ArrowRight, LockKeyhole, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { money } from "../lib/format.js";
import { useStore } from "../lib/store.jsx";
import { EmptyState, QuantityControl } from "../components/UI.jsx";

export default function Cart() {
  const { cart, updateCartItem, removeCartItem, clearCart, applyCoupon, cartCount } = useStore();
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [busyItem, setBusyItem] = useState("");
  const navigate = useNavigate();

  const items = cart?.cartItems || [];

  const runAction = async (id, action) => {
    setBusyItem(id);
    try {
      await action();
    } catch {
      // store notifies
    } finally {
      setBusyItem("");
    }
  };

  const submitCoupon = async (event) => {
    event.preventDefault();
    setCouponError("");
    try {
      await applyCoupon(code.trim());
      setCode("");
    } catch (error) {
      setCouponError(error.message);
    }
  };

  if (!items.length) {
    return (
      <div className="container py-16">
        <div className="page-head mb-10 rounded-3xl">
          <h1>Your cart</h1>
          <p>Review your items and checkout when you're ready.</p>
        </div>
        <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Browse the store and add something you love." to="/shop" />
      </div>
    );
  }

  return (
    <div className="container py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Almost there</span>
          <h1 className="text-3xl font-bold">Your cart <span className="text-base font-medium text-slate-400">({cartCount} items)</span></h1>
        </div>
        <Link className="text-link" to="/shop">Continue shopping <ArrowRight size={16} /></Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => {
            const product = item.product || {};
            const unitPrice = item.price ?? product.priceAfterDiscount ?? product.price ?? 0;
            return (
              <article key={item._id} className="panel flex flex-wrap items-center gap-4 sm:flex-nowrap">
                <Link to={`/product/${item.productId}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  <img src={product.imgCover} alt={product.title || "Product"} className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${item.productId}`} className="font-bold hover:text-brand-700">{product.title || "Product"}</Link>
                  <p className="mt-1 text-xs text-slate-500">{product.category?.name || "Luma select"}</p>
                  <p className="mt-2 text-sm font-bold text-brand-700">{money(unitPrice)}</p>
                </div>
                <QuantityControl
                  value={item.quantity}
                  onChange={(quantity) => runAction(item._id, () => updateCartItem(item._id, quantity))}
                />
                <strong className="w-20 text-right text-sm">{money(unitPrice * item.quantity)}</strong>
                <button
                  type="button"
                  className="icon-btn text-slate-400 hover:text-rose-600"
                  onClick={() => runAction(item._id, () => removeCartItem(item._id))}
                  disabled={busyItem === item._id}
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </article>
            );
          })}

          <button className="btn btn--danger btn--sm" type="button" onClick={clearCart}>
            <Trash2 size={15} /> Clear cart
          </button>
        </div>

        <aside className="panel h-fit lg:sticky lg:top-24">
          <h2>Order summary</h2>
          <div className="space-y-3 text-sm">
            <div className="summary-row"><span>Subtotal</span><strong>{money(cart.totalPrice)}</strong></div>
            <div className="summary-row"><span>Delivery</span><strong className="text-brand-700">{cart.totalPrice >= 150 ? "Free" : money(12)}</strong></div>
            {cart.discount > 0 && <div className="summary-row text-brand-700"><span>Coupon ({cart.discount}%)</span><strong>−{money(cart.totalPrice - cart.totalPriceAfterDiscount)}</strong></div>}
          </div>
          <div className="summary-total"><span>Total</span><strong>{money(cart.totalPriceAfterDiscount ?? cart.totalPrice)}</strong></div>

          <form className="mt-5" onSubmit={submitCoupon}>
            <label className="mb-2 block text-xs font-semibold" htmlFor="coupon">Have a coupon?</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="coupon" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm" placeholder="LUMA10" value={code} onChange={(event) => setCode(event.target.value)} />
              </div>
              <button className="btn btn--outline btn--sm" type="submit">Apply</button>
            </div>
            {couponError && <p className="field-error mt-2">{couponError}</p>}
          </form>

          <button className="btn btn--primary mt-6 w-full" type="button" onClick={() => navigate("/checkout")}>
            <LockKeyhole size={17} /> Checkout
          </button>
          <p className="mt-3 text-center text-[11px] text-slate-500">Secure checkout · 30-day returns</p>
        </aside>
      </div>
    </div>
  );
}

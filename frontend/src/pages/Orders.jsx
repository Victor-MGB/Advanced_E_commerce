import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Package, Truck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../lib/api.js";
import { money, shortDate } from "../lib/format.js";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { Badge, EmptyState, Spinner } from "../components/UI.jsx";

function OrdersContent() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-10 sm:py-14">
      <span className="eyebrow">Your account</span>
      <h1 className="text-3xl font-bold">Orders</h1>
      <p className="mt-2 text-sm text-slate-500">Track your purchases and revisit what you ordered.</p>

      {location.state?.placed && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
          <CheckCircle2 size={20} /> Thank you! Your order has been placed and is being prepared.
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <Spinner label="Loading orders" />
        ) : orders.length === 0 ? (
          <EmptyState icon={Package} title="No orders yet" text="When you place an order, it will appear right here." to="/shop" />
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article className="panel" key={order._id}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <strong className="text-sm">Order #{order._id.slice(-8).toUpperCase()}</strong>
                    <p className="text-xs text-slate-500">Placed {shortDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="slate">{order.paymentMethod === "card" ? "Paystack" : "Cash on delivery"}</Badge>
                    <Badge tone={order.isDelivered ? "green" : "amber"}>
                      {order.isDelivered ? "Delivered" : order.isPaid ? "Paid · Processing" : "Processing"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 grid gap-5 md:grid-cols-[1fr_240px]">
                  <div className="space-y-3">
                    {order.cartItems.map((item, index) => (
                      <div key={item._id || index} className="flex items-center gap-3">
                        <img src={item.product?.imgCover} alt="" className="h-14 w-14 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{item.product?.title || "Product"}</p>
                          <p className="text-xs text-slate-500">Qty {item.quantity} · {money(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                    <p className="mb-2 flex items-center gap-2 font-bold text-ink"><MapPin size={15} className="text-brand-700" /> Deliver to</p>
                    <p>{order.shippingAddress?.street}</p>
                    <p>{order.shippingAddress?.city} · {order.shippingAddress?.phone}</p>
                    <p className="mt-3 flex items-center gap-2 text-brand-700"><Truck size={15} /> Estimated 2–4 business days</p>
                    <div className="summary-total text-base"><span>Total</span><strong>{money(order.totalOrderPrice)}</strong></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="mt-8 text-sm text-slate-500">Need help with an order? <Link className="font-bold text-brand-700" to="/account">Contact support</Link></p>
    </div>
  );
}

export default function Orders() {
  return <ProtectedRoute><OrdersContent /></ProtectedRoute>;
}

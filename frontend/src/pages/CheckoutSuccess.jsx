import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useStore } from "../lib/store.jsx";
import { Spinner } from "../components/UI.jsx";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref");
  const { refreshCart } = useStore();
  const [status, setStatus] = useState(reference ? "verifying" : "done");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;

    api
      .verifyPayment(reference)
      .then(() => {
        if (cancelled) return;
        setStatus("done");
        refreshCart();
      })
      .catch((exception) => {
        if (cancelled) return;
        setStatus("error");
        setError(exception.message);
      });

    return () => {
      cancelled = true;
    };
  }, [reference, refreshCart]);

  if (status === "verifying") {
    return (
      <div className="container flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
        <Spinner label="Confirming your payment" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle size={32} />
        </span>
        <span className="eyebrow">Payment not confirmed</span>
        <h1 className="text-3xl font-bold">We couldn't confirm your payment</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
          {error ||
            "Please check your orders page in a moment, or contact support if you were charged."}
        </p>
        {reference && (
          <p className="mt-3 rounded-md bg-slate-50 px-4 py-2 font-mono text-[11px] text-slate-500">
            Reference: {reference.slice(-12)}
          </p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="btn btn--primary" to="/orders"><Package size={17} /> Check my orders</Link>
          <Link className="btn btn--ghost" to="/cart"><ShoppingBag size={17} /> Back to cart</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={32} />
      </span>
      <span className="eyebrow">Payment confirmed</span>
      <h1 className="text-3xl font-bold">Thanks for your order</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
        Your payment was received. We're preparing your parcel and you'll be able to track it
        from your orders page shortly.
      </p>
      {reference && (
        <p className="mt-3 rounded-md bg-slate-50 px-4 py-2 font-mono text-[11px] text-slate-500">
          Reference: {reference.slice(-12)}
        </p>
      )}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link className="btn btn--primary" to="/orders"><Package size={17} /> View my orders</Link>
        <Link className="btn btn--ghost" to="/shop"><ShoppingBag size={17} /> Continue shopping</Link>
      </div>
    </div>
  );
}

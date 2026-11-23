import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { EmptyState } from "../components/UI.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { useStore } from "../lib/store.jsx";

function WishlistContent() {
  const { wishlist } = useStore();

  return (
    <div className="container py-10 sm:py-14">
      <span className="eyebrow">Saved for later</span>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Your wishlist</h1>
          <p className="mt-2 text-sm text-slate-500">{wishlist.length} saved {wishlist.length === 1 ? "item" : "items"}</p>
        </div>
        <Link className="text-link" to="/shop">Keep exploring →</Link>
      </div>

      <div className="mt-8">
        {wishlist.length === 0 ? (
          <EmptyState icon={Heart} title="Nothing saved yet" text="Tap the heart on any product to keep it here for later." to="/shop" />
        ) : (
          <div className="product-grid">
            {wishlist.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Wishlist() {
  return <ProtectedRoute><WishlistContent /></ProtectedRoute>;
}

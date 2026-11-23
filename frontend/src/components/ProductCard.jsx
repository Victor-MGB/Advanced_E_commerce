import { useState } from "react";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store.jsx";
import { Badge, Price, Rating } from "./UI.jsx";

export default function ProductCard({ product, categoryName }) {
  const { addToCart, toggleWishlist, wishlist, isAuthenticated, notify } = useStore();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const saved = wishlist.some((item) => item._id === product._id);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      notify("Sign in to add items to your cart", "error");
      navigate("/signin");
      return;
    }
    setAdding(true);
    try {
      await addToCart(product._id, 1);
    } catch {
      // notification handled by the store
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="product-card group">
      <div className="product-card__media">
        <Link to={`/product/${product._id}`} aria-label={product.title}>
          <img src={product.imgCover} alt={product.title} loading="lazy" />
        </Link>
        <div className="product-card__badges">
          {product.priceAfterDiscount > 0 && (
            <Badge tone="sale">-{Math.round((1 - product.priceAfterDiscount / product.price) * 100)}%</Badge>
          )}
          {product.badge && <Badge tone={product.badge === "Sale" ? "amber" : "teal"}>{product.badge}</Badge>}
        </div>
        <button
          type="button"
          className={`icon-btn icon-btn--glass ${saved ? "is-active" : ""}`}
          onClick={() => toggleWishlist(product._id)}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          className="product-card__add"
          onClick={handleAdd}
          disabled={adding || product.quantity === 0}
        >
          {adding ? <Check size={17} /> : <ShoppingBag size={17} />}
          <span>{adding ? "Added" : "Add to cart"}</span>
        </button>
      </div>
      <div className="product-card__body">
        {categoryName && <span className="product-card__category">{categoryName}</span>}
        <Link className="product-card__title" to={`/product/${product._id}`}>
          {product.title}
        </Link>
        <Rating value={product.ratingAvg || 0} count={product.ratingCount} compact />
        <Price product={product} />
      </div>
    </article>
  );
}

import { useEffect, useState } from "react";
import {
  Check,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { money, finalPrice } from "../lib/format.js";
import { useStore } from "../lib/store.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { Badge, Breadcrumbs, EmptyState, Price, Rating, Spinner } from "../components/UI.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, isAuthenticated, notify, user } = useStore();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState("description");
  const [adding, setAdding] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [sendingReview, setSendingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    api
      .getProduct(id)
      .then(async (data) => {
        setProduct(data);
        const [categories, siblings] = await Promise.all([
          api.getCategories(),
          api.getProducts({ category: data.category, limit: 5 }),
        ]);
        setCategoryName(categories.find((item) => item._id === data.category)?.name || "");
        setRelated(siblings.data.filter((item) => item._id !== data._id).slice(0, 4));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading product" />;
  if (!product) {
    return (
      <div className="container py-16">
        <EmptyState title="Product not found" text="This item may have been moved or sold out." to="/shop" />
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.imgCover];
  const saved = wishlist.some((item) => item._id === product._id);

  const handleAdd = async (goToCart = false) => {
    if (!isAuthenticated) {
      notify("Sign in to add items to your cart", "error");
      navigate("/signin");
      return;
    }
    setAdding(true);
    try {
      await addToCart(product._id, quantity);
      if (goToCart) navigate("/cart");
    } catch {
      // handled by store
    } finally {
      setAdding(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      notify("Sign in to leave a review", "error");
      return;
    }
    setSendingReview(true);
    try {
      await api.addReview({ productId: product._id, ...review });
      const fresh = await api.getProduct(id);
      setProduct(fresh);
      setReview({ rating: 5, comment: "" });
      notify("Thanks for sharing your review!");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSendingReview(false);
    }
  };

  return (
    <div className="container py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: "Shop", to: "/shop" },
          { label: categoryName || "Products", to: categoryName ? `/shop?category=${product.category}` : "/shop" },
          { label: product.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
            <img src={images[activeImage]} alt={product.title} className="aspect-square w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((image, index) => (
                <button
                  key={image + index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition ${index === activeImage ? "border-brand-700" : "border-transparent"}`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Badge tone={product.badge === "Sale" ? "amber" : "teal"}>{product.badge || categoryName}</Badge>
            {product.sold > 200 && <Badge tone="slate">{product.sold}+ sold</Badge>}
          </div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{product.title}</h1>
          <div className="mt-3 flex items-center gap-4">
            <Rating value={product.ratingAvg || 0} count={product.ratingCount} />
            <span className="text-xs text-slate-500">SKU: {String(product._id || product.id || "").toUpperCase() || "—"}</span>
          </div>
          <div className="mt-6"><Price product={product} size="lg" /></div>
          <p className="mt-5 text-sm leading-7 text-slate-600">{product.description}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="quantity">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease"><Minus size={16} /></button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(product.quantity || 99, value + 1))} aria-label="Increase"><Plus size={16} /></button>
            </div>
            <button className="btn btn--primary flex-1" type="button" onClick={() => handleAdd()} disabled={adding || product.quantity === 0}>
              {adding ? <Check size={18} /> : <ShoppingBag size={18} />}
              {product.quantity === 0 ? "Out of stock" : "Add to cart"}
            </button>
            <button
              type="button"
              className={`btn btn--ghost ${saved ? "text-rose-600" : ""}`}
              onClick={() => toggleWishlist(product._id)}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
          <button className="btn btn--outline mt-3 w-full" type="button" onClick={() => handleAdd(true)} disabled={product.quantity === 0}>
            Buy it now
          </button>

          <div className="mt-7 grid gap-3 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
            <span className="flex items-center gap-2 text-xs text-slate-600"><Truck size={17} className="text-brand-700" /> Free delivery over $150</span>
            <span className="flex items-center gap-2 text-xs text-slate-600"><ShieldCheck size={17} className="text-brand-700" /> Secure checkout</span>
            <span className="flex items-center gap-2 text-xs text-slate-600"><RotateCcw size={17} className="text-brand-700" /> 30-day returns</span>
            <span className="flex items-center gap-2 text-xs text-slate-600"><PackageCheck size={17} className="text-brand-700" /> {product.quantity} in stock</span>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <div className="flex gap-6 border-b border-slate-200">
          {[
            ["description", "Description"],
            ["reviews", `Reviews (${product.reviews?.length || 0})`],
            ["shipping", "Shipping & returns"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`border-b-2 pb-3 text-sm font-bold transition ${tab === key ? "border-brand-700 text-brand-700" : "border-transparent text-slate-500"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="py-7">
          {tab === "description" && (
            <div className="max-w-3xl space-y-4 text-sm leading-7 text-slate-600">
              <p>{product.description}</p>
              <p>Carefully sourced and quality checked, this piece is designed to stay in rotation. Every order is packed with care and backed by our 30-day return promise.</p>
              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                <div className="panel"><small className="text-slate-500">Price</small><p className="font-bold">{money(finalPrice(product))}</p></div>
                <div className="panel"><small className="text-slate-500">Category</small><p className="font-bold">{categoryName || "—"}</p></div>
                <div className="panel"><small className="text-slate-500">Brand</small><p className="font-bold">{product.brand?.name || "Luma Select"}</p></div>
              </div>
            </div>
          )}

          {tab === "reviews" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {product.reviews?.length ? product.reviews.map((item) => (
                  <article key={item._id} className="panel">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm">{item.user?.name || item.userId?.name || "Customer"}</strong>
                      <Rating value={item.rating || 5} compact />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.comment || item.text}</p>
                  </article>
                )) : <p className="text-sm text-slate-500">No reviews yet. Be the first to share your thoughts.</p>}
              </div>
              <form className="panel h-fit" onSubmit={submitReview}>
                <h3>Write a review</h3>
                <div className="field">
                  <label htmlFor="rating">Your rating</label>
                  <select id="rating" value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })}>
                    {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
                  </select>
                </div>
                <div className="field mt-4">
                  <label htmlFor="comment">Your review</label>
                  <textarea id="comment" required value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} placeholder="What did you think?" />
                </div>
                <button className="btn btn--primary mt-4 w-full" disabled={sendingReview} type="submit">
                  {sendingReview ? "Posting…" : "Post review"}
                </button>
                {!isAuthenticated && <p className="field-error mt-2">Sign in to post a review.</p>}
              </form>
            </div>
          )}

          {tab === "shipping" && (
            <div className="max-w-3xl space-y-3 text-sm leading-7 text-slate-600">
              <p>Orders placed before 2pm are dispatched the same working day. Delivery usually takes 2–4 business days within major cities.</p>
              <p>Return any unused item within 30 days of delivery for a full refund. Start a return from your account page or contact our support team.</p>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-6 text-2xl font-bold">You may also like</h2>
          <div className="product-grid">
            {related.map((item) => <ProductCard key={item._id} product={item} categoryName={categoryName} />)}
          </div>
        </section>
      )}
    </div>
  );
}

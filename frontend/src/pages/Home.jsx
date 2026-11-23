import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { heroArt, productArt } from "../lib/art.js";
import ProductCard from "../components/ProductCard.jsx";
import { Spinner } from "../components/UI.jsx";

const promises = [
  { icon: Truck, title: "Fast delivery", text: "Dispatched within 24 hours" },
  { icon: ShieldCheck, title: "Secure checkout", text: "Encrypted payments, always" },
  { icon: RotateCcw, title: "Easy returns", text: "30-day hassle-free returns" },
  { icon: Headphones, title: "Real support", text: "Helpful humans, 7 days a week" },
];

const testimonials = [
  {
    quote: "The ordering flow is refreshingly simple and the quality exceeded the price. My new go-to store.",
    name: "Ngozi A.",
    role: "Verified buyer · Lagos",
  },
  {
    quote: "Delivery to Abuja took two days. The packaging was beautiful and the product felt premium.",
    name: "Yusuf B.",
    role: "Verified buyer · Abuja",
  },
  {
    quote: "Great range of thoughtful essentials. Customer support answered every question within minutes.",
    name: "Grace N.",
    role: "Verified buyer · Port Harcourt",
  },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getProducts({ limit: 8, sort: "popular" })])
      .then(([categoryList, result]) => {
        setCategories(categoryList.slice(0, 6));
        setProducts(result.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const categoryNames = Object.fromEntries(categories.map((category) => [category._id, category.name]));

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="hero__eyebrow"><BadgeCheck size={16} /> Luma deals of the week</span>
            <h1>Big brands. <em>Small prices.</em> Everyday joy.</h1>
            <p>
              Tech, fashion, home and beauty essentials at prices that make sense — with fast
              delivery across Abuja, Lagos and beyond.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary btn--lg" to="/shop">
                Shop now <ArrowRight size={18} />
              </Link>
              <Link className="btn btn--ghost btn--lg" to="/shop?sort=price-asc">
                See today's deals
              </Link>
            </div>
            <div className="hero__stats">
              <div><strong>12k+</strong><span>Happy customers</span></div>
              <div><strong>4.8/5</strong><span>Average rating</span></div>
              <div><strong>48h</strong><span>Average delivery</span></div>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__halo" />
            <video
              className="hero__image"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={heroArt}
              aria-label="Animated Luma shopping essentials"
            >
              <source src="/hero-loop.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <div className="container promise-strip">
        {promises.map(({ icon: Icon, title, text }) => (
          <div className="promise" key={title}>
            <span className="promise__icon"><Icon size={21} /></span>
            <div><strong>{title}</strong><small>{text}</small></div>
          </div>
        ))}
      </div>

      <div className="container campaign-grid">
        <Link className="campaign-tile campaign-tile--orange" to="/shop?category=c1">
          <div><span>Tech week</span><strong>Up to 40% off</strong><small>Headphones, watches &amp; more</small></div>
          <img src={productArt.headphones} alt="Wireless headphones" loading="lazy" />
        </Link>
        <Link className="campaign-tile campaign-tile--navy" to="/shop?category=c2">
          <div><span>Step out</span><strong>New season kicks</strong><small>Fresh pairs, everyday prices</small></div>
          <img src={productArt.sneaker} alt="Running sneakers" loading="lazy" />
        </Link>
        <Link className="campaign-tile campaign-tile--light" to="/shop?category=c3">
          <div><span>Home edit</span><strong>Make it yours</strong><small>Comfort meets clean design</small></div>
          <img src={productArt.chair} alt="Lounge chair" loading="lazy" />
        </Link>
      </div>

      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Shop by category</span>
            <h2>Explore the store</h2>
            <p>Everything you need, sorted the way you shop.</p>
          </div>
          <Link className="text-link" to="/shop">All categories <ArrowRight size={17} /></Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card group" to={`/shop?category=${category._id}`} key={category._id}>
              <div className="category-card__media"><img src={category.image} alt="" loading="lazy" /></div>
              <div className="category-card__body">
                <strong>{category.name}</strong>
                <span>Explore <ArrowRight size={15} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-heading">
            <div>
            <span className="eyebrow">Trending now</span>
            <h2>Best sellers</h2>
            <p>The pieces our customers keep coming back for.</p>
            </div>
            <Link className="text-link" to="/shop">Shop all <ArrowRight size={17} /></Link>
          </div>
          {loading ? (
            <Spinner label="Loading products" />
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} categoryName={categoryNames[product.category]} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container">
        <div className="promo-banner">
          <div className="promo-banner__copy">
            <span className="eyebrow">The everyday edit</span>
            <h2>Designed to make ordinary days feel a little better.</h2>
            <p>Considered materials, clean lines and honest pricing. Everything in our store earns its place.</p>
            <Link className="btn btn--light" to="/shop">Discover the edit <ArrowRight size={18} /></Link>
          </div>
          <div className="promo-banner__art">
            <img src={productArt.chair} alt="Form lounge chair" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Kind words</span>
            <h2>Loved by real people</h2>
          </div>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <blockquote className="testimonial" key={item.name}>
              <div className="testimonial__stars">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} fill="currentColor" />)}
              </div>
              <p>“{item.quote}”</p>
              <footer><strong>{item.name}</strong><span>{item.role}</span></footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}

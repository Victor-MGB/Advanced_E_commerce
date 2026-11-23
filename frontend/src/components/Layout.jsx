import { useState } from "react";
import {
  ChevronDown,
  Facebook,
  Heart,
  Instagram,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  X,
  LayoutDashboard,
  Package,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { DEMO_MODE } from "../lib/api.js";
import { useStore } from "../lib/store.jsx";
import SupportBot from "./SupportBot.jsx";

function Header() {
  const { cartCount, wishlist, isAuthenticated, user, isAdmin, signOut } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/shop?keyword=${encodeURIComponent(search.trim())}`);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="announcement">
        <div className="container announcement__inner">
          <span><MapPin size={15} /> Deliver to Abuja</span>
          <span className="announcement__hide"><Truck size={15} /> Free delivery on orders over $150</span>
          <span className="announcement__hide"><ShieldCheck size={15} /> Secure checkout &amp; easy returns</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container site-header__inner">
          <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
            <span className="brand__mark"><ShoppingBag size={21} strokeWidth={2.2} /></span>
            <span>luma<span className="brand__dot">.</span></span>
          </Link>

          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`}>
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
            <NavLink to="/shop?category=c1" onClick={() => setMenuOpen(false)}>Categories</NavLink>
            <NavLink to="/shop?sort=price-asc" onClick={() => setMenuOpen(false)}>Deals</NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)}>Our story</NavLink>
          </nav>

          <form className="header-search" onSubmit={submitSearch}>
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search"><Search size={19} /></button>
          </form>

          <div className="header-actions">
            <Link className="icon-btn header-actions__wish" to="/wishlist" aria-label="Wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="count-dot">{wishlist.length}</span>}
            </Link>

            <div className="user-menu">
              <button
                type="button"
                className="icon-btn"
                onClick={() => setUserOpen((open) => !open)}
                aria-label="Account menu"
              >
                <UserRound size={20} />
                <ChevronDown size={13} className="user-menu__chevron" />
              </button>
              {userOpen && (
                <>
                  <button className="menu-backdrop" aria-label="Close menu" onClick={() => setUserOpen(false)} />
                  <div className="user-menu__panel">
                    {isAuthenticated ? (
                      <>
                        <div className="user-menu__hello">
                          <strong>{user?.name || "Welcome back"}</strong>
                          <span>{user?.email || "Your account"}</span>
                        </div>
                        <Link to="/account" onClick={() => setUserOpen(false)}><UserRound size={16} /> My profile</Link>
                        <Link to="/orders" onClick={() => setUserOpen(false)}><Package size={16} /> My orders</Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setUserOpen(false)}><LayoutDashboard size={16} /> Admin dashboard</Link>
                        )}
                        <button type="button" onClick={() => { signOut(); setUserOpen(false); navigate("/"); }}>
                          <LogOut size={16} /> Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="user-menu__hello">
                          <strong>Welcome</strong>
                          <span>Sign in for a tailored experience</span>
                        </div>
                        <Link to="/signin" onClick={() => setUserOpen(false)}>Sign in</Link>
                        <Link to="/signup" onClick={() => setUserOpen(false)}>Create account</Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <Link className="icon-btn" to="/cart" aria-label="Shopping cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="count-dot count-dot--teal">{cartCount}</span>}
            </Link>

            <button className="icon-btn mobile-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <nav className="category-nav">
        <div className="container category-nav__inner">
          <Link className="category-nav__all" to="/shop"><Menu size={16} /> All categories</Link>
          <Link to="/shop?category=c1">Electronics</Link>
          <Link to="/shop?category=c2">Fashion</Link>
          <Link to="/shop?category=c3">Home &amp; Living</Link>
          <Link to="/shop?category=c4">Beauty</Link>
          <Link to="/shop?category=c5">Sports</Link>
          <Link to="/shop?category=c6">Accessories</Link>
          <Link className="category-nav__deals" to="/shop?sort=price-asc">Today's deals</Link>
        </div>
      </nav>

      {menuOpen && (
        <form className="mobile-search container" onSubmit={submitSearch}>
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products…" />
        </form>
      )}
    </>
  );
}

function Footer() {
  const { notify } = useStore();
  const [email, setEmail] = useState("");

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand brand--light" to="/">
            <span className="brand__mark"><ShoppingBag size={21} /></span>
            <span>luma<span className="brand__dot">.</span></span>
          </Link>
          <p>Curated essentials for people who value good design, fair prices and a smooth shopping experience.</p>
          <div className="footer-contact">
            <span><MapPin size={16} /> 14 Bloom Street, Abuja, NG</span>
            <span><Phone size={16} /> +234 800 123 4567</span>
            <span><Mail size={16} /> hello@lumastore.com</span>
          </div>
        </div>

        <div className="footer-links">
          <h4>Shop</h4>
          <Link to="/shop">All products</Link>
          <Link to="/shop?category=c1">Electronics</Link>
          <Link to="/shop?category=c2">Fashion</Link>
          <Link to="/shop?category=c3">Home &amp; living</Link>
          <Link to="/shop?sort=price-asc">Deals</Link>
        </div>

        <div className="footer-links">
          <h4>Support</h4>
          <Link to="/about">Our story</Link>
          <Link to="/account">Track an order</Link>
          <Link to="/account">Shipping &amp; returns</Link>
          <Link to="/account">Contact us</Link>
          <Link to="/signin">My account</Link>
        </div>

        <div className="footer-news">
          <h4>Stay in the loop</h4>
          <p>New drops, restocks and member-only offers.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              notify(`Thanks! ${email || "You're"} on the list.`);
              setEmail("");
            }}
          >
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="Email address"
            />
            <button type="submit" aria-label="Subscribe">→</button>
          </form>
          <div className="socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">X</a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Luma Store. Built as a portfolio project.</span>
        <span className="footer-bottom__note">
          {DEMO_MODE ? "Demo data mode" : "Connected to live API"} · Secure payments
        </span>
      </div>
    </footer>
  );
}

function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main><Outlet /></main>
      <Footer />
      <Toasts />
      <SupportBot />
    </div>
  );
}

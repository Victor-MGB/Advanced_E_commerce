import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { money, finalPrice } from "../lib/format.js";

export function Rating({ value = 0, count, compact = false }) {
  return (
    <span className={`rating ${compact ? "rating--compact" : ""}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={compact ? 13 : 15}
          fill={star <= Math.round(value) ? "currentColor" : "none"}
          strokeWidth={1.6}
        />
      ))}
      {count !== undefined && <span className="rating__count">({count})</span>}
    </span>
  );
}

export function Price({ product, size = "md" }) {
  const current = finalPrice(product);
  const hasDiscount = product?.priceAfterDiscount > 0;
  return (
    <span className={`price price--${size}`}>
      <strong>{money(current)}</strong>
      {hasDiscount && <s>{money(product.price)}</s>}
    </span>
  );
}

export function Badge({ children, tone = "teal" }) {
  if (!children) return null;
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function Spinner({ label = "Loading" }) {
  return (
    <div className="spinner" role="status">
      <Loader2 size={24} className="spin" />
      <span>{label}…</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, to, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <span className="empty-state__icon">
          <Icon size={28} strokeWidth={1.6} />
        </span>
      )}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {to && (
        <Link className="btn btn--primary" to={to}>
          {action || "Explore products"}
        </Link>
      )}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, text, to, linkText = "View all" }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {linkText} <ChevronRight size={17} />
        </Link>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          <ChevronRight size={14} />
          {item.to ? <Link to={item.to}>{item.label}</Link> : <b>{item.label}</b>}
        </span>
      ))}
    </nav>
  );
}

export function QuantityControl({ value = 1, onChange, min = 1 }) {
  return (
    <div className="quantity">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Decrease quantity">
        <Minus size={15} />
      </button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        <Plus size={15} />
      </button>
    </div>
  );
}

export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5
  );

  return (
    <div className="pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
        <ChevronLeft size={18} />
      </button>
      {pages.map((number) => (
        <button
          type="button"
          key={number}
          className={number === page ? "is-active" : ""}
          onClick={() => onPage(number)}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

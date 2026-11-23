import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../lib/api.js";
import { useStore } from "../lib/store.jsx";
import {
  extractOrderId,
  extractProductQuery,
  formatMoney,
  intentLabel,
  matchIntent,
  normalize,
  quickRepliesFor,
  rankIntents,
  staticAnswer,
} from "../lib/support.js";

async function loadCart(context) {
  try {
    return (await api.getCart()) || context.cart;
  } catch {
    return context.cart;
  }
}

async function trackReply(context, text) {
  if (!context.isAuthenticated) {
    return "Sign in from the account menu, then open My orders to see your order status. If you have an order number, share it here and I'll try to find it.";
  }

  try {
    const orders = await api.getOrders();
    const list = Array.isArray(orders) ? orders : orders?.data || [];
    if (!list.length) return "You don't have any orders yet. Browse the shop and place an order whenever you're ready.";

    const requestedId = extractOrderId(text);
    const order = requestedId
      ? list.find((item) => String(item._id).toLowerCase().includes(requestedId.toLowerCase()))
      : list[0];

    if (!order) return `I couldn't find order ${requestedId}. Check the number in My orders and try again.`;

    const placed = new Date(order.createdAt).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const payment = order.isPaid ? "paid" : "awaiting payment";
    const delivery = order.isDelivered ? "delivered" : "not delivered yet";
    const id = String(order._id).slice(-8);

    return `Order ${id} was placed on ${placed}. Payment: ${payment}. Delivery: ${delivery}. We usually deliver in 2–5 working days, and you'll get a tracking email when the parcel is dispatched.`;
  } catch {
    return "I couldn't load your orders right now. Open My orders from the account menu or try again shortly.";
  }
}

async function cartReply(context) {
  const cart = await loadCart(context);
  const items = cart?.cartItems || [];
  if (!items.length) return "Your cart is empty. Browse Today's deals, or ask me to find a product for you.";

  const quantity = items.reduce((total, item) => total + (Number(item.quantity) || 0), 0) || context.cartCount;
  const titles = items.slice(0, 3).map((item) => {
    const title = item.product?.title || item.title || item.name || "Item";
    return `${item.quantity || 1}× ${title}`;
  });
  const more = items.length > 3 ? ` and ${items.length - 3} more` : "";
  const total = cart.totalPriceAfterDiscount ?? cart.totalPrice;

  return `Your cart has ${quantity} item${quantity === 1 ? "" : "s"}: ${titles.join(", ")}${more}. Current total is ${formatMoney(total)}. You can change quantities on the cart page.`;
}

function wishlistReply(context) {
  const items = context.wishlist || [];
  if (!items.length) return "Your wishlist is empty. Tap the heart on any product to save it for later.";

  const titles = items.slice(0, 4).map((item) => item.title || item.name || "Saved item");
  const more = items.length > 4 ? ` and ${items.length - 4} more` : "";
  return `You have ${items.length} saved item${items.length === 1 ? "" : "s"}: ${titles.join(", ")}${more}.`;
}

async function productReply(context) {
  const query = context.productQuery;
  if (!query) return "Which product are you looking for? Try “price of headphones” or “do you have a smartwatch”.";

  try {
    const result = await api.getProducts({ keyword: query, limit: 3 });
    const products = Array.isArray(result) ? result : result?.data || [];
    if (!products.length) return `I couldn't find “${query}” in the catalogue. Try a shorter name like “headphones”, “watch” or “sneakers”.`;

    const total = result.total ?? products.length;
    const listed = products
      .map((product) => `${product.title} (${formatMoney(product.priceAfterDiscount || product.price)})`)
      .join(", ");

    return `I found ${total} match${total === 1 ? "" : "es"} for “${query}”. Top results: ${listed}. Ask me for the price of one, or open the shop page to compare.`;
  } catch {
    return "I couldn't check the catalogue right now. Try the search bar, or ask again in a moment.";
  }
}

function productImage(product) {
  if (!product) return null;
  const src = product.imgCover || product.images?.[0];
  if (!src) return null;
  return {
    src,
    title: product.title || "Product",
    price: product.priceAfterDiscount || product.price,
    id: product._id || product.slug,
  };
}

function imagesFromCart(cart) {
  return (cart?.cartItems || [])
    .map((item) => productImage(item.product || item))
    .filter(Boolean)
    .slice(0, 4);
}

function imagesFromWishlist(items) {
  return (items || []).map((item) => productImage(item)).filter(Boolean).slice(0, 4);
}

async function imageReply(context, text) {
  const value = normalize(text);

  if (/\b(cart|basket|bag)\b/.test(value)) {
    const images = imagesFromCart(await loadCart(context));
    if (!images.length) return "Your cart is empty, so there are no pictures to show yet.";
    return { text: "Here are the items currently in your cart:", images };
  }

  if (/wishlist|saved|favourite|favorite/.test(value)) {
    const images = imagesFromWishlist(context.wishlist);
    if (!images.length) return "Your wishlist is empty, so there's nothing to show yet.";
    return { text: "Here are your saved items:", images };
  }

  if (/categor/.test(value)) {
    try {
      const categories = await api.getCategories();
      const images = categories
        .map((category) => ({
          src: category.image,
          title: category.name,
          id: category._id,
          href: `/shop?category=${category._id}`,
        }))
        .filter((image) => image.src)
        .slice(0, 6);
      if (images.length) return { text: "Here are our categories:", images };
    } catch {
      return "I couldn't load category images right now. Try again shortly.";
    }
  }

  const query = context.productQuery;
  if (!query) return staticAnswer("image");

  try {
    const result = await api.getProducts({ keyword: query, limit: 3 });
    const products = Array.isArray(result) ? result : result?.data || [];
    if (!products.length) return `I couldn't find a picture for “${query}”. Try a shorter name like “headphones” or “sneakers”.`;

    const images = products.map((product) => productImage(product)).filter(Boolean).slice(0, 3);
    if (!images.length) return `I found “${query}” but there's no image attached to those products.`;

    return { text: `Here ${images.length === 1 ? "is" : "are"} ${images.length} picture${images.length === 1 ? "" : "s"} for “${query}”:`, images };
  } catch {
    return "I couldn't load product images right now. Try the shop page, or ask again in a moment.";
  }
}

async function categoriesReply() {
  try {
    const categories = await api.getCategories();
    const names = categories.map((category) => category.name).filter(Boolean).slice(0, 8);
    if (names.length) return `We stock ${names.join(", ")}. Browse them from the category bar under the header.`;
  } catch {
    return staticAnswer("categories");
  }
  return staticAnswer("categories");
}

async function shippingCostReply(context) {
  const base = staticAnswer("shippingCost");
  const cart = await loadCart(context);
  const total = cart?.totalPriceAfterDiscount ?? cart?.totalPrice;
  if (typeof total !== "number") return base;

  if (total >= 150) return `Your current cart total is ${formatMoney(total)}, so delivery is free. ${base}`;
  return `Your current cart total is ${formatMoney(total)}, which is ${formatMoney(150 - total)} away from free delivery. ${base}`;
}

function accountReply(context) {
  if (!context.isAuthenticated) return "Sign in from the account menu to see your orders, wishlist and addresses. You can create an account in a few seconds.";

  const firstName = context.user?.name?.split(" ")[0] || "there";
  const email = context.user?.email || "your account";
  return `Hi ${firstName}! You're signed in as ${email}. From My profile you can update your details and password; My orders shows tracking, and Wishlist shows saved items.`;
}

function fallbackReply(context) {
  const suggestions = context.ranked.slice(0, 2).map((item) => intentLabel(item.id));
  const topics = suggestions.length ? suggestions.join(" or ") : "orders, delivery or returns";
  return `I'm not completely sure — I can help with ${topics}. Try “where is my order?”, “price of headphones” or “talk to a human”.`;
}

function asMessage(value) {
  return typeof value === "string" ? { text: value, images: [] } : value;
}

async function buildReply(intentId, text, context) {
  let reply = "";

  switch (intentId) {
    case "track":
      reply = await trackReply(context, text);
      break;
    case "cart":
      reply = await cartReply(context);
      break;
    case "wishlist":
      reply = wishlistReply(context);
      break;
    case "product":
      reply = await productReply(context);
      break;
    case "image":
      reply = await imageReply(context, text);
      break;
    case "categories":
      reply = await categoriesReply();
      break;
    case "shippingCost":
      reply = await shippingCostReply(context);
      break;
    case "account":
      reply = accountReply(context);
      break;
    default:
      reply = staticAnswer(intentId);
  }

  const message = asMessage(reply);
  if (!message.text) {
    message.text = fallbackReply(context);
    message.images = [];
  }

  const secondary = context.ranked.find((item) => item.id !== intentId && item.score >= 4);
  if (secondary && intentId !== "help" && intentId !== "fallback" && intentId !== "image") {
    message.text += ` You also mentioned ${intentLabel(secondary.id)} — ask me about that next.`;
  }

  return message;
}

export default function SupportBot() {
  const { cart, cartCount, wishlist, user, isAuthenticated } = useStore();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [suggestions, setSuggestions] = useState(quickRepliesFor("greeting"));
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      from: "bot",
      text: "Hi! I'm Luma Assistant. I can check orders, cart totals and product prices, or answer common questions. What do you need?",
    },
  ]);
  const timerRef = useRef(null);
  const endRef = useRef(null);
  const contextRef = useRef({ lastIntent: "greeting", productQuery: "" });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages, thinking, open]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const sendMessage = async (text) => {
    const value = text.trim();
    if (!value || thinking) return;

    setMessages((current) => [...current, { id: `${Date.now()}-user`, from: "user", text: value }]);
    setDraft("");
    setThinking(true);

    const ranked = rankIntents(value);
    const detected = matchIntent(value);
    const followUp = detected.score === 0 && /^(and|what about|how about|about|then|also)\b/.test(normalize(value));
    const intentId = followUp ? contextRef.current.lastIntent : detected.id;
    const productQuery = extractProductQuery(value) || ((intentId === "product" || intentId === "image") ? contextRef.current.productQuery : "");

    contextRef.current = {
      lastIntent: intentId,
      productQuery: productQuery || contextRef.current.productQuery,
    };
    setSuggestions(quickRepliesFor(intentId));

    const context = {
      cart,
      cartCount,
      wishlist,
      user,
      isAuthenticated,
      productQuery,
      ranked,
    };

    const startedAt = Date.now();
    let answer;
    try {
      answer = await buildReply(intentId, value, context);
    } catch {
      answer = { text: "Something went wrong while I looked that up. Please try again, or email hello@lumastore.com.", images: [] };
    }

    const message = asMessage(answer);
    const wait = Math.max(0, 420 - (Date.now() - startedAt));
    timerRef.current = setTimeout(() => {
      setMessages((current) => [...current, { id: `${Date.now()}-bot`, from: "bot", text: message.text, images: message.images }]);
      setThinking(false);
    }, wait);
  };

  return (
    <div className="support-bot">
      {open && (
        <div className="support-bot__panel" role="dialog" aria-label="Luma support chat">
          <div className="support-bot__header">
            <span className="support-bot__avatar"><Bot size={18} /></span>
            <div className="min-w-0 flex-1">
              <strong>Luma Assistant</strong>
              <p>Store data + quick answers</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
          </div>

          <div className="support-bot__messages" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`support-bot__row ${message.from === "user" ? "support-bot__row--user" : ""}`}
              >
                {message.from === "bot" && (
                  <span className="support-bot__avatar"><Bot size={14} /></span>
                )}
                <div className={`support-bot__bubble support-bot__bubble--${message.from}`}>
                  {message.text}
                  {message.images?.length > 0 && (
                    <div className="support-bot__images">
                      {message.images.map((image, index) => (
                        <Link
                          key={`${image.id || image.src}-${index}`}
                          className="support-bot__image-card"
                          to={image.href || (image.id ? `/product/${image.id}` : "/shop")}
                        >
                          <img src={image.src} alt={image.title} />
                          <span title={image.title}>{image.title}</span>
                          {image.price ? <strong>{formatMoney(image.price)}</strong> : null}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="support-bot__row">
                <span className="support-bot__avatar"><Bot size={14} /></span>
                <div className="support-bot__bubble support-bot__bubble--bot">Checking…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="support-bot__quick">
            {suggestions.map((reply) => (
              <button key={reply} type="button" onClick={() => sendMessage(reply)}>{reply}</button>
            ))}
          </div>

          <form
            className="support-bot__form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(draft);
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask us anything…"
              aria-label="Your message"
            />
            <button type="submit" aria-label="Send message"><Send size={18} /></button>
          </form>
        </div>
      )}

      <button
        className="support-bot__button"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        aria-expanded={open}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <span className="support-bot__dot" />}
      </button>
    </div>
  );
}

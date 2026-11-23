export const helpTopics = [
  "orders",
  "delivery",
  "returns",
  "payments",
  "products",
  "account",
  "cart",
  "contact",
];

const QUICK_REPLIES = [
  "Where is my order?",
  "Delivery times",
  "Returns & refunds",
  "Payment options",
  "What's in my cart?",
  "Picture of headphones",
  "Talk to a human",
];

const CONTEXT_QUICK_REPLIES = {
  track: ["Latest order", "When will it arrive?", "Talk to a human"],
  delivery: ["Delivery cost", "Track my order", "Returns"],
  cart: ["Show cart pictures", "Cart total", "Payment options"],
  product: ["Picture of headphones", "Price of headphones", "Cheapest options"],
  image: ["Price of headphones", "Show cart pictures", "Talk to a human"],
  returns: ["Refund timeline", "Damaged item", "Talk to a human"],
  payments: ["Card payment", "Cash on delivery", "Failed payment"],
  account: ["Change password", "My orders", "Wishlist"],
  fallback: QUICK_REPLIES,
};

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "to", "of", "in", "on", "at", "for", "with",
  "is", "are", "was", "were", "be", "been", "do", "does", "did", "have", "has", "had",
  "i", "me", "my", "we", "you", "your", "it", "this", "that", "these", "those", "there",
  "here", "what", "when", "where", "which", "who", "how", "why", "can", "could", "would",
  "should", "please", "thanks", "thank", "about", "any", "some", "now", "today", "get",
]);

const KNOWN_PRODUCTS = [
  "headphones", "headphone", "earbuds", "earbud", "watch", "smartwatch", "smart watch",
  "sneakers", "sneaker", "shoes", "shoe", "backpack", "camera", "speaker", "sunglasses",
  "lamp", "chair", "bottle", "perfume", "trail runner", "smart watch",
  "keyboard", "mouse", "skincare", "dumbbell", "mug", "coffee", "jacket",
  "handbag", "purse", "yoga", "yoga mat", "tumbler", "travel mug", "flask",
];

const INTENTS = {
  image: {
    phrases: [
      "show me a picture", "show me an image", "show me a photo", "send a picture",
      "send a photo", "picture of", "image of", "photo of", "photos of",
      "what does it look like", "product image", "product picture", "can i see it",
      "categories with pictures", "pictures of categories", "show me the images",
    ],
    keywords: ["picture", "pictures", "image", "images", "photo", "photos", "visual", "look"],
  },
  greeting: {
    phrases: ["good morning", "good afternoon", "good evening", "hello there", "hi there", "hey there"],
    keywords: ["hello", "hi", "hey", "greetings", "morning", "afternoon", "evening"],
  },
  help: {
    phrases: ["what can you do", "how can you help", "show me options", "list topics", "help me", "what do you know"],
    keywords: ["help", "options", "capabilities", "topics", "menu", "guide"],
  },
  track: {
    phrases: [
      "track my order", "order status", "where is my order", "where is my parcel",
      "when will my order arrive", "delivery status", "check order", "order tracking",
      "latest order", "my orders", "where is my package",
    ],
    keywords: ["track", "tracking", "parcel", "package", "order"],
  },
  cart: {
    phrases: [
      "my cart", "shopping cart", "whats in my cart", "how many items in my cart",
      "cart total", "basket", "shopping bag", "my bag",
    ],
    keywords: ["cart", "basket", "subtotal", "quantity"],
  },
  wishlist: {
    phrases: ["my wishlist", "saved items", "favourite items", "favorite items", "wish list"],
    keywords: ["wishlist", "saved", "favourites", "favorites"],
  },
  product: {
    phrases: [
      "do you have", "looking for", "search for", "find me", "show me", "price of",
      "price for", "how much is", "how much are", "in stock", "is it available",
      "product details", "tell me about", "cheapest", "best selling", "top rated",
    ],
    keywords: ["product", "products", "item", "items", "stock", "available", "price", "cost", ...KNOWN_PRODUCTS],
  },
  categories: {
    phrases: ["what categories", "what do you sell", "browse categories", "shop by category"],
    keywords: ["category", "categories", "electronics", "fashion", "beauty", "sports", "accessories"],
  },
  delivery: {
    phrases: [
      "delivery times", "how long does delivery take", "when will it arrive", "shipping times",
      "how long will it take", "delivery areas", "do you deliver to", "dispatch time",
    ],
    keywords: ["delivery", "shipping", "ship", "arrive", "arrival", "eta", "courier", "dispatch", "nigeria", "abuja", "lagos"],
  },
  shippingCost: {
    phrases: [
      "shipping cost", "delivery cost", "delivery fee", "shipping fee", "how much is delivery",
      "how much is shipping", "free delivery", "cost of delivery", "postage",
    ],
    keywords: ["fee", "postage", "shipping", "delivery", "free"],
  },
  returns: {
    phrases: [
      "return policy", "return my order", "refund my order", "send it back", "exchange item",
      "wrong item", "damaged item", "faulty item", "wrong size", "refund timeline",
    ],
    keywords: ["return", "refund", "exchange", "damaged", "defective", "faulty", "broken"],
  },
  cancelOrder: {
    phrases: ["cancel my order", "cancel order", "change my order", "change delivery address", "stop my order"],
    keywords: ["cancel", "change", "amend", "address"],
  },
  payments: {
    phrases: [
      "payment options", "how can i pay", "pay by card", "cash on delivery", "failed payment",
      "charged twice", "paid twice", "card declined", "secure payment", "bank transfer",
    ],
    keywords: ["payment", "pay", "card", "paystack", "cash", "charged", "declined", "refunded"],
  },
  coupons: {
    phrases: ["promo code", "coupon code", "discount code", "voucher code", "todays deals", "best deals"],
    keywords: ["coupon", "promo", "voucher", "discount", "deal", "sale", "offer"],
  },
  account: {
    phrases: ["my account", "create account", "sign up", "log in", "sign in", "update my profile", "my profile"],
    keywords: ["account", "profile", "signup", "signin", "login", "register", "email"],
  },
  password: {
    phrases: ["change password", "forgot password", "reset password", "cant log in", "cant sign in", "login issue"],
    keywords: ["password", "reset", "forgot", "locked", "issue"],
  },
  contact: {
    phrases: [
      "talk to a human", "speak to an agent", "contact support", "call you", "email you",
      "make a complaint", "customer service", "support team", "talk to someone",
    ],
    keywords: ["human", "agent", "person", "call", "phone", "email", "contact", "complaint", "support"],
  },
  hours: {
    phrases: ["opening hours", "working hours", "support hours", "are you open", "open on weekend"],
    keywords: ["hours", "open", "closed", "weekend", "saturday", "sunday"],
  },
  bulk: {
    phrases: ["bulk order", "wholesale", "corporate order", "gift card", "gift order", "large order"],
    keywords: ["bulk", "wholesale", "corporate", "gift", "office", "school"],
  },
  security: {
    phrases: ["is this site safe", "is my data secure", "privacy policy", "fraud", "scam"],
    keywords: ["secure", "security", "safe", "privacy", "data", "fraud", "scam"],
  },
  sizing: {
    phrases: ["size guide", "what size", "true to size", "sizing help"],
    keywords: ["size", "sizing", "fit", "measurement"],
  },
  reviews: {
    phrases: ["product reviews", "customer reviews", "ratings", "review this product"],
    keywords: ["review", "reviews", "rating", "ratings", "stars"],
  },
  warranty: {
    phrases: ["warranty", "guarantee", "manufacturer warranty"],
    keywords: ["warranty", "guarantee"],
  },
  feedback: {
    phrases: ["give feedback", "leave feedback", "suggestion", "compliment"],
    keywords: ["feedback", "suggestion", "idea", "compliment"],
  },
  language: {
    phrases: ["do you speak", "another language", "speak french", "speak yoruba"],
    keywords: ["language", "french", "yoruba", "hausa", "igbo"],
  },
  admin: {
    phrases: ["admin dashboard", "manage products", "staff access", "seller account"],
    keywords: ["admin", "dashboard", "staff", "seller", "manage"],
  },
  demo: {
    phrases: ["demo mode", "sample data", "test order", "is this real", "portfolio project"],
    keywords: ["demo", "sample", "test", "portfolio", "fake"],
  },
  thanks: {
    phrases: ["thank you", "thanks a lot", "appreciate it", "much appreciated"],
    keywords: ["thanks", "thank", "appreciate"],
  },
  goodbye: {
    phrases: ["see you", "good bye", "talk later", "bye now"],
    keywords: ["bye", "goodbye", "later"],
  },
};

const STATIC_ANSWERS = {
  track: "You can see order status from My orders in the account menu. Share an order number here and I'll try to find it for you.",
  image: "Tell me which product you'd like to see — for example, “picture of headphones” or “show me a photo of sneakers”.",
  greeting: "Hi! I'm Luma Assistant. I can check your cart and latest order, look up product prices, and answer common shopping questions. What do you need?",
  help: "I can help with: order tracking, delivery times and costs, returns and refunds, payments, coupons, product availability and prices, your cart or wishlist, account and password questions, and contact details. Ask naturally, like “where is my order?” or “price of headphones”.",
  delivery: "We deliver across Nigeria in 2–5 working days. Orders are dispatched from Abuja, and you'll get an email with tracking details once they're on the way. Delivery is free on orders over $150.",
  shippingCost: "Delivery is free on orders over $150. Below that, the exact fee is shown at checkout based on your address. You can see it before you pay.",
  returns: "Unused items can be returned within 7 days of delivery. Email hello@lumastore.com with your order number and the item, and we'll arrange collection. Refunds go back to your original payment method within 5–10 working days.",
  cancelOrder: "Orders can be cancelled before dispatch. Email hello@lumastore.com with your order number as soon as possible; once a parcel has shipped, we'll arrange a return instead.",
  payments: "You can pay securely by card through Paystack or choose cash on delivery. Card payments are confirmed immediately; cash orders are confirmed when the courier hands over your parcel. If a payment fails, check your card details or try another card.",
  coupons: "Add a valid coupon code in your cart before checkout, or browse Today's deals in the category bar for discounted items. Coupons are applied to the cart total before payment.",
  categories: "We stock Electronics, Fashion, Home & Living, Beauty, Sports and Accessories. You can browse them from the category bar under the header.",
  account: "Sign in from the account menu to see your orders, wishlist and addresses. You can update your name, email and password from My profile.",
  password: "Open My profile and use Change password to set a new one. If you can't sign in at all, email hello@lumastore.com and we'll help you recover the account.",
  contact: "You can reach our team at hello@lumastore.com or +234 800 123 4567, Monday to Saturday, 9am–6pm. We usually reply within one working day.",
  hours: "Our support team is available Monday to Saturday, 9am–6pm. Orders can be placed any time and we'll respond on the next working day.",
  bulk: "For bulk, corporate or gift orders, email hello@lumastore.com with the items, quantities and delivery city. We'll send a tailored quote.",
  security: "Checkout is handled by Paystack and account sessions use secure tokens. We'll never ask for your password, card number or OTP in chat — please don't share those here.",
  sizing: "Most fashion items are true to size. Check the product description for specifics, or email hello@lumastore.com with the product name and we'll confirm measurements.",
  reviews: "You can read customer ratings and reviews on each product page under the Reviews tab. Reviews help other shoppers choose confidently.",
  warranty: "Electronics carry the manufacturer's warranty. Keep your order email as proof of purchase and contact us if you need help with a claim.",
  feedback: "Thanks! We'd love to hear it — email hello@lumastore.com with your suggestion. Every piece of feedback helps us improve the store.",
  language: "I currently reply in English. For help in another language, email hello@lumastore.com and we'll do our best to assist.",
  admin: "Admins can manage products, categories, orders and customers from the Admin dashboard. Regular shoppers won't see that option.",
  demo: "This storefront runs in demo mode by default, so carts and orders are stored locally in your browser. The live version connects to the API and database.",
  thanks: "Happy to help! Ask me again anytime.",
  goodbye: "Goodbye! Come back if you need anything else.",
};

function scoreIntent(definition, value, tokenList) {
  let score = 0;
  for (const phrase of definition.phrases) {
    if (value.includes(phrase)) score += Math.max(phrase.split(" ").length, 1) * 3;
  }
  for (const keyword of definition.keywords) {
    if (tokenList.includes(keyword)) score += 2;
  }
  return score;
}

export function normalize(value = "") {
  return String(value ?? "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9₦$]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function words(value = "") {
  return normalize(value).split(" ").filter((word) => word && !STOP_WORDS.has(word));
}

export function rankIntents(text) {
  const value = normalize(text);
  const tokenList = words(text);
  return Object.entries(INTENTS)
    .map(([id, definition]) => ({ id, score: scoreIntent(definition, value, tokenList) }))
    .filter((item) => item.score > 0)
    .sort((first, second) => second.score - first.score);
}

export function matchIntent(text) {
  return rankIntents(text)[0] || { id: "fallback", score: 0 };
}

function tidyQuery(value = "") {
  return normalize(value)
    .replace(/\b(the|a|an|any|some|please|thanks|available|in stock|price|cost)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractProductQuery(text) {
  const value = normalize(text);
  const patterns = [
    /(?:picture|image|photo|photos) of\s+(.{2,60})$/,
    /(?:show me|send me)\s+(?:a|an|the)?\s*(?:picture|image|photo)\s+of\s+(.{2,60})$/,
    /(?:price of|price for|cost of|how much is|how much are|do you have|looking for|search for|find me|show me|stock of|tell me about)\s+(.{2,60})$/,
    /^(.{2,60})\s+(?:price|cost)$/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) {
      const query = tidyQuery(match[1]);
      if (query) return query;
    }
  }

  const found = KNOWN_PRODUCTS.find((product) => value.includes(product));
  return found ? tidyQuery(found) : "";
}

export function extractOrderId(text) {
  const ignored = new Set(["status", "tracking", "number", "id", "please", "now", "my", "latest"]);
  const explicit = String(text ?? "").match(/(?:order|ord)(?:\s*(?:id|number|no))?\s*[:#-]?\s*([a-z0-9_-]{4,})/i);
  if (explicit && !ignored.has(explicit[1].toLowerCase())) return explicit[1];
  const direct = String(text ?? "").match(/\b(ord_[a-z0-9_-]{4,})\b/i);
  return direct ? direct[1] : "";
}

export function staticAnswer(id) {
  return STATIC_ANSWERS[id] || "";
}

export function intentLabel(id) {
  return id
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase())
    .replace("Cart", "your cart")
    .replace("Track", "order tracking")
    .replace("Wishlist", "your wishlist")
    .replace("Password", "password help")
    .replace("Shipping Cost", "delivery costs")
    .replace("Cancel Order", "cancelling an order")
    .replace("Talk To A Human", "contacting support");
}

export function quickRepliesFor(id) {
  return CONTEXT_QUICK_REPLIES[id] || QUICK_REPLIES;
}

export function formatMoney(value) {
  const amount = Number(value) || 0;
  return `$${amount.toFixed(2)}`;
}

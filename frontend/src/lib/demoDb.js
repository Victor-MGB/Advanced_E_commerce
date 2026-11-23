import {
  demoBrands,
  demoCategories,
  demoCoupons,
  demoProducts,
  demoReviews,
  demoSubcategories,
  demoUser,
} from "./demoSeed.js";

const PREFIX = "luma_v3_";

const read = (key, seed) => {
  const stored = localStorage.getItem(PREFIX + key);
  if (stored) {
    const value = JSON.parse(stored);
    if (key === "products" && Array.isArray(value) && Array.isArray(seed)) {
      const ids = new Set(value.map((item) => item._id));
      const missing = seed.filter((item) => !ids.has(item._id));
      if (missing.length) {
        const merged = [...value, ...missing];
        localStorage.setItem(PREFIX + key, JSON.stringify(merged));
        return merged;
      }
    }
    return value;
  }
  const value = structuredClone(seed);
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
  return value;
};

const write = (key, value) => {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
  return value;
};

const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const delay = () => new Promise((resolve) => setTimeout(resolve, 180));

export const demoDb = {
  async getProducts(params = {}) {
    await delay();
    let items = [...read("products", demoProducts)];
    const { keyword, category, brand, sort, minPrice, maxPrice, page = 1, limit = 8 } = params;

    if (keyword) {
      const term = String(keyword).toLowerCase();
      items = items.filter((item) =>
        `${item.title} ${item.description}`.toLowerCase().includes(term)
      );
    }
    if (category) items = items.filter((item) => item.category === category);
    if (brand) items = items.filter((item) => item.brand === brand);
    if (minPrice !== undefined && minPrice !== "") {
      items = items.filter((item) => item.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== "") {
      items = items.filter((item) => item.price <= Number(maxPrice));
    }
    if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
    else if (sort === "rating") items.sort((a, b) => b.ratingAvg - a.ratingAvg);
    else if (sort === "newest") {
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else items.sort((a, b) => b.sold - a.sold);

    const total = items.length;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Number(limit) || 8, 100);
    const start = (pageNumber - 1) * pageSize;

    return {
      data: items.slice(start, start + pageSize),
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async getProduct(id) {
    await delay();
    const products = read("products", demoProducts);
    const product = products.find((item) => item._id === id || item.slug === id);
    if (!product) throw new Error("Product not found");
    const reviews = read("reviews", demoReviews).filter((review) => review.productId === product._id);
    return { ...product, reviews };
  },

  async getCategories() {
    await delay();
    return read("categories", demoCategories);
  },

  async getSubcategories() {
    await delay();
    return read("subcategories", demoSubcategories);
  },

  async getBrands() {
    await delay();
    return read("brands", demoBrands);
  },

  async signIn({ email, password }) {
    await delay();
    if (!email || !password || password.length < 6) {
      throw new Error("Invalid email or password");
    }
    const user = { ...demoUser, email, name: email.split("@")[0].replace(/[._]/g, " ") };
    write("user", user);
    return { token: "demo-token", user };
  },

  async signUp({ name, email }) {
    await delay();
    const user = { ...demoUser, name: name || "New Shopper", email, wishlist: [], addresses: [] };
    write("user", user);
    write("wishlist", []);
    return { token: "demo-token", user };
  },

  getMe() {
    return read("user", demoUser);
  },

  updateMe(patch) {
    return write("user", { ...read("user", demoUser), ...patch });
  },

  async getWishlist() {
    await delay();
    const ids = read("wishlist", demoUser.wishlist);
    const products = read("products", demoProducts);
    return ids.map((id) => products.find((product) => product._id === id)).filter(Boolean);
  },

  async toggleWishlist(productId, method) {
    await delay();
    const ids = read("wishlist", demoUser.wishlist);
    const exists = ids.includes(productId);
    const next = method === "DELETE" || exists ? ids.filter((id) => id !== productId) : [...ids, productId];
    write("wishlist", next);
    return next;
  },

  calculateCart(items, discount = 0) {
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      _id: "demo-cart",
      cartItems: items,
      totalPrice,
      discount,
      totalPriceAfterDiscount: Number((totalPrice - (totalPrice * discount) / 100).toFixed(2)),
    };
  },

  async getCart() {
    await delay();
    const items = read("cart", []);
    if (!items.length) return null;
    const products = read("products", demoProducts);
    const cartItems = items.map((item) => ({
      ...item,
      product: products.find((product) => product._id === item.productId),
    }));
    return this.calculateCart(cartItems, read("discount", 0));
  },

  async addToCart(productId, quantity = 1) {
    await delay();
    const products = read("products", demoProducts);
    const product = products.find((item) => item._id === productId);
    if (!product) throw new Error("Product not found");
    const items = read("cart", []);
    const existing = items.find((item) => item.productId === productId);
    const price = product.priceAfterDiscount > 0 ? product.priceAfterDiscount : product.price;
    if (existing) existing.quantity += quantity;
    else {
      items.push({
        _id: uid("item"),
        productId,
        quantity,
        price,
        totalProductDiscount: product.price - price,
      });
    }
    write("cart", items);
    return this.getCart();
  },

  async updateCartItem(itemId, quantity) {
    await delay();
    const items = read("cart", []).map((item) =>
      item._id === itemId ? { ...item, quantity } : item
    );
    write("cart", items);
    return this.getCart();
  },

  async removeCartItem(itemId) {
    await delay();
    write("cart", read("cart", []).filter((item) => item._id !== itemId));
    return this.getCart();
  },

  async clearCart() {
    await delay();
    write("cart", []);
    write("discount", 0);
    return null;
  },

  async applyCoupon(code) {
    await delay();
    const coupon = read("coupons", demoCoupons).find(
      (item) => item.code.toLowerCase() === String(code).toLowerCase()
    );
    if (!coupon) throw new Error("Invalid or expired coupon");
    write("discount", coupon.discount);
    return this.getCart();
  },

  async changePassword() {
    await delay();
    return { message: "Password updated" };
  },

  async getAddresses() {
    await delay();
    return read("user", demoUser).addresses || [];
  },

  async addAddress(address) {
    await delay();
    const user = read("user", demoUser);
    const addresses = [...(user.addresses || []), { ...address, _id: uid("addr") }];
    write("user", { ...user, addresses });
    return addresses;
  },

  async removeAddress(addressId) {
    await delay();
    const user = read("user", demoUser);
    const addresses = (user.addresses || []).filter((item) => item._id !== addressId);
    write("user", { ...user, addresses });
    return addresses;
  },

  async getOrders() {
    await delay();
    return read("orders", []);
  },

  async createOrder({ shippingAddress, paymentMethod = "cash" }) {
    await delay();
    const cart = await this.getCart();
    if (!cart?.cartItems.length) throw new Error("Your cart is empty");
    const order = {
      _id: uid("order"),
      user: demoUser._id,
      cartItems: cart.cartItems,
      shippingAddress,
      totalOrderPrice: cart.totalPriceAfterDiscount,
      paymentMethod,
      isPaid: paymentMethod === "card",
      isDelivered: false,
      createdAt: new Date().toISOString(),
    };
    write("orders", [order, ...read("orders", [])]);
    await this.clearCart();
    return order;
  },

  async addReview({ productId, rating, comment }) {
    await delay();
    const user = read("user", demoUser);
    const review = {
      _id: uid("review"),
      productId,
      userId: user._id,
      user: { name: user.name },
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    write("reviews", [review, ...read("reviews", demoReviews)]);
    return review;
  },

  async createProduct(payload) {
    await delay();
    const products = read("products", demoProducts);
    const product = {
      _id: uid("p"),
      priceAfterDiscount: 0,
      quantity: 0,
      sold: 0,
      ratingAvg: 0,
      ratingCount: 0,
      images: [],
      createdAt: new Date().toISOString(),
      ...payload,
    };
    write("products", [product, ...products]);
    return product;
  },

  async createCategory(payload) {
    await delay();
    const categories = read("categories", demoCategories);
    const category = {
      _id: uid("c"),
      image: categoryArtMapFallback(),
      ...payload,
    };
    write("categories", [category, ...categories]);
    return category;
  },

  couponExists(code) {
    return read("coupons", demoCoupons).some((item) => item.code === code);
  },

  reset() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  },
};

function categoryArtMapFallback() {
  return demoCategories[0].image;
}

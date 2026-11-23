import { demoDb } from "./demoDb.js";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://advanced-e-commerce-ireg.onrender.com/api/v1";
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true" || !API_URL;

let tokenProvider = () => null;
export const setTokenProvider = (provider) => {
  tokenProvider = provider;
};

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = tokenProvider() || localStorage.getItem("luma_token");
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach the API. Check that the backend is running.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload.errors?.map((error) => error.message).join(", ");
    throw new Error(detail || payload.message || `Request failed (${response.status})`);
  }
  return payload;
}

const list = (payload) => (Array.isArray(payload) ? payload : payload.data || []);
const single = (payload) => payload?.data ?? payload;

const normalizeProduct = (product) => ({
  ...product,
  imgCover: product.imgCover || product.images?.[0] || "",
  images: product.images?.length ? product.images : [product.imgCover].filter(Boolean),
  reviews: product.reviews || [],
});

const normalizeCartItem = (item) => {
  const populated = item.productId && typeof item.productId === "object" ? item.productId : null;
  return {
    ...item,
    product: populated || item.product || null,
    productId: populated?._id || item.productId,
  };
};

const normalizeCart = (payload) => {
  const cart = payload?.data ?? payload;
  if (!cart) return null;
  return {
    ...cart,
    cartItems: (cart.cartItems || []).map(normalizeCartItem),
  };
};

const normalizeOrder = (order) => ({
  ...order,
  cartItems: (order.cartItems || []).map(normalizeCartItem),
});

export const api = {
  async getProducts(params = {}) {
    if (DEMO_MODE) return demoDb.getProducts(params);
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") query.set(key, value);
    });
    const payload = await request(`/products?${query}`);
    return {
      data: list(payload).map(normalizeProduct),
      total: payload.total ?? list(payload).length,
      page: payload.page || 1,
      limit: payload.limit || 8,
      totalPages: payload.totalPages || Math.ceil((payload.total || 0) / (payload.limit || 8)),
    };
  },

  async getProduct(id) {
    if (DEMO_MODE) return demoDb.getProduct(id);
    return normalizeProduct(single(await request(`/products/${id}`)));
  },

  async getCategories() {
    if (DEMO_MODE) return demoDb.getCategories();
    return list(await request("/categories?limit=100")).map((category) => ({
      ...category,
      image: category.image || category.Image,
    }));
  },

  async getSubcategories() {
    if (DEMO_MODE) return demoDb.getSubcategories();
    return list(await request("/subcategories?limit=100"));
  },

  async getBrands() {
    if (DEMO_MODE) return demoDb.getBrands();
    return list(await request("/brands?limit=100"));
  },

  async signIn(credentials) {
    if (DEMO_MODE) return demoDb.signIn(credentials);
    const payload = await request("/auth/signin", { method: "POST", body: credentials });
    return { token: payload.token, user: payload.user };
  },

  async signUp(payload) {
    if (DEMO_MODE) return demoDb.signUp(payload);
    const result = await request("/auth/signup", { method: "POST", body: payload });
    return { token: result.token, user: result.user };
  },

  async getMe() {
    if (DEMO_MODE) return demoDb.getMe();
    const result = await request("/users/me", { auth: true });
    return result.data;
  },

  async updateMe(patch) {
    if (DEMO_MODE) return demoDb.updateMe(patch);
    return (await request("/users/me", { method: "PATCH", body: patch, auth: true })).data;
  },

  async getWishlist() {
    if (DEMO_MODE) return demoDb.getWishlist();
    const payload = await request("/wishlist", { auth: true });
    return payload.wishlist || payload.data || [];
  },

  async toggleWishlist(productId, method) {
    if (DEMO_MODE) return demoDb.toggleWishlist(productId, method);
    const payload = await request("/wishlist", {
      method,
      body: { productId },
      auth: true,
    });
    return payload.wishlist || payload.data || [];
  },

  async getCart() {
    if (DEMO_MODE) return demoDb.getCart();
    return normalizeCart(await request("/cart", { auth: true }));
  },

  async addToCart(productId, quantity = 1) {
    if (DEMO_MODE) return demoDb.addToCart(productId, quantity);
    return normalizeCart(
      await request("/cart", { method: "POST", body: { productId, quantity }, auth: true })
    );
  },

  async updateCartItem(itemId, quantity) {
    if (DEMO_MODE) return demoDb.updateCartItem(itemId, quantity);
    return normalizeCart(
      await request(`/cart/${itemId}`, { method: "PUT", body: { quantity }, auth: true })
    );
  },

  async removeCartItem(itemId) {
    if (DEMO_MODE) return demoDb.removeCartItem(itemId);
    return normalizeCart(await request(`/cart/${itemId}`, { method: "DELETE", auth: true }));
  },

  async clearCart() {
    if (DEMO_MODE) return demoDb.clearCart();
    return normalizeCart(await request("/cart", { method: "DELETE", auth: true }));
  },

  async applyCoupon(code) {
    if (DEMO_MODE) return demoDb.applyCoupon(code);
    return normalizeCart(
      await request("/cart/apply-coupon", { method: "POST", body: { code }, auth: true })
    );
  },

  async changePassword(payload) {
    if (DEMO_MODE) return demoDb.changePassword(payload);
    return request("/users/me/password", { method: "PATCH", body: payload, auth: true });
  },

  async getAddresses() {
    if (DEMO_MODE) return demoDb.getAddresses();
    return list(await request("/address", { auth: true }));
  },

  async addAddress(address) {
    if (DEMO_MODE) return demoDb.addAddress(address);
    return list(await request("/address", { method: "PATCH", body: address, auth: true }));
  },

  async removeAddress(addressId) {
    if (DEMO_MODE) return demoDb.removeAddress(addressId);
    return list(
      await request("/address", { method: "DELETE", body: { addressId }, auth: true })
    );
  },

  async getOrders() {
    if (DEMO_MODE) return demoDb.getOrders();
    return list(await request("/orders", { auth: true })).map(normalizeOrder);
  },

  async createOrder({ cartId, shippingAddress, paymentMethod }) {
    if (DEMO_MODE) return demoDb.createOrder({ shippingAddress, paymentMethod });
    const path = paymentMethod === "card" ? `/orders/checkout/${cartId}` : `/orders/${cartId}`;
    const payload = await request(path, {
      method: "POST",
      body: { shippingAddress },
      auth: true,
    });
    if (paymentMethod === "card") return payload.data;
    return normalizeOrder(payload.data || payload.order);
  },

  async verifyPayment(reference) {
    if (DEMO_MODE) return null;
    const payload = await request(`/orders/verify/${encodeURIComponent(reference)}`, {
      auth: true,
    });
    return normalizeOrder(payload.data);
  },

  async addReview(payload) {
    if (DEMO_MODE) return demoDb.addReview(payload);
    return (await request("/review", { method: "POST", body: payload, auth: true })).data;
  },

  async createProduct(payload) {
    if (DEMO_MODE) return demoDb.createProduct(payload);
    return (await request("/products", { method: "POST", body: payload, auth: true })).data;
  },

  async createCategory(payload) {
    if (DEMO_MODE) return demoDb.createCategory(payload);
    return (await request("/categories", { method: "POST", body: payload, auth: true })).data;
  },

  async getAllOrders() {
    if (DEMO_MODE) return demoDb.getOrders();
    return list(await request("/orders/all", { auth: true })).map(normalizeOrder);
  },
};

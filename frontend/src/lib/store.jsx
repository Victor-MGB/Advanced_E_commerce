import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, DEMO_MODE, setTokenProvider } from "./api.js";

const StoreContext = createContext(null);

const savedToken = () => localStorage.getItem("luma_token") ?? (DEMO_MODE ? "demo-token" : null);

export function StoreProvider({ children }) {
  const [token, setToken] = useState(savedToken);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setTokenProvider(() => token);
  }, [token]);

  const notify = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      setCart(await api.getCart());
    } catch (error) {
      notify(error.message, "error");
    }
  }, [notify]);

  const refreshWishlist = useCallback(async () => {
    try {
      const items = await api.getWishlist();
      setWishlist(Array.isArray(items) ? items : []);
    } catch {
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setCart(null);
      setWishlist([]);
      return;
    }
    api.getMe().then(setUser).catch(() => setUser(null));
    refreshCart();
    refreshWishlist();
  }, [token, refreshCart, refreshWishlist]);

  const signIn = useCallback(
    async (credentials) => {
      const result = await api.signIn(credentials);
      localStorage.setItem("luma_token", result.token);
      setToken(result.token);
      setUser(result.user);
      notify(`Welcome back, ${result.user.name.split(" ")[0]}!`);
      return result;
    },
    [notify]
  );

  const signUp = useCallback(
    async (payload) => {
      const result = await api.signUp(payload);
      localStorage.setItem("luma_token", result.token);
      setToken(result.token);
      setUser(result.user);
      notify("Your account is ready. Happy shopping!");
      return result;
    },
    [notify]
  );

  const signOut = useCallback(() => {
    localStorage.setItem("luma_token", "");
    setToken("");
    setUser(null);
    setCart(null);
    setWishlist([]);
    notify("You have been signed out.");
  }, [notify]);

  const withCartAction = useCallback(
    async (action, successMessage) => {
      try {
        const result = await action();
        if (result !== undefined) setCart(result);
        if (successMessage) notify(successMessage);
        return result;
      } catch (error) {
        notify(error.message, "error");
        throw error;
      }
    },
    [notify]
  );

  const addToCart = useCallback(
    (productId, quantity = 1) =>
      withCartAction(
        () => api.addToCart(productId, quantity),
        "Added to your cart"
      ),
    [withCartAction]
  );

  const updateCartItem = useCallback(
    (itemId, quantity) => withCartAction(() => api.updateCartItem(itemId, quantity)),
    [withCartAction]
  );

  const removeCartItem = useCallback(
    (itemId) => withCartAction(() => api.removeCartItem(itemId), "Item removed"),
    [withCartAction]
  );

  const clearCart = useCallback(
    () => withCartAction(() => api.clearCart(), "Cart cleared"),
    [withCartAction]
  );

  const applyCoupon = useCallback(
    (code) => withCartAction(() => api.applyCoupon(code), "Coupon applied"),
    [withCartAction]
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      const wasSaved = wishlist.some((item) => item._id === productId);
      try {
        const method = wasSaved ? "DELETE" : "PATCH";
        await api.toggleWishlist(productId, method);
        await refreshWishlist();
        notify(wasSaved ? "Removed from wishlist" : "Saved to wishlist");
      } catch (error) {
        notify(error.message, "error");
      }
    },
    [wishlist, notify, refreshWishlist]
  );

  const cartCount = useMemo(
    () => cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0,
    [cart]
  );

  const value = {
    token,
    user,
    setUser,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === "admin",
    signIn,
    signUp,
    signOut,
    cart,
    cartCount,
    refreshCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    applyCoupon,
    wishlist,
    toggleWishlist,
    refreshWishlist,
    toasts,
    notify,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
};

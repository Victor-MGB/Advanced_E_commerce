import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { cartModel } from "../../../Database/models/cart.model.js";
import { productModel } from "../../../Database/models/product.model.js";
import { couponModel } from "../../../Database/models/coupon.model.js";

function calcTotalPrice(cart) {
  cart.totalPrice = cart.cartItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
}

function applyDiscount(cart) {
  cart.totalPriceAfterDiscount = cart.discount
    ? Number((cart.totalPrice - (cart.totalPrice * cart.discount) / 100).toFixed(2))
    : cart.totalPrice;
}

function findCartItem(cart, itemId) {
  return cart.cartItems.find((item) => item._id.toString() === itemId);
}

export const addProductToCart = catchAsyncError(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await productModel
    .findById(productId)
    .select("price priceAfterDiscount");
  if (!product) return next(new AppError("Product not found", 404));

  const price = product.priceAfterDiscount > 0 ? product.priceAfterDiscount : product.price;
  const item = {
    productId,
    quantity,
    price,
    totalProductDiscount: product.price - price,
  };

  let cart = await cartModel.findOne({ userId: req.user._id });

  if (!cart) {
    cart = new cartModel({ userId: req.user._id, cartItems: [item] });
  } else {
    const existingItem = cart.cartItems.find(
      (cartItem) => cartItem.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = price;
      existingItem.totalProductDiscount = item.totalProductDiscount;
    } else {
      cart.cartItems.push(item);
    }
  }

  calcTotalPrice(cart);
  applyDiscount(cart);
  await cart.save();

  res.status(200).json({ message: "success", data: cart });
});

export const getLoggedUserCart = catchAsyncError(async (req, res) => {
  const cart = await cartModel
    .findOne({ userId: req.user._id })
    .populate("cartItems.productId");

  if (!cart) return res.status(200).json({ message: "success", data: null });

  res.status(200).json({ message: "success", data: cart });
});

export const removeProductFromCart = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  const item = findCartItem(cart, req.params.id);
  if (!item) return next(new AppError("Item not in cart", 404));

  cart.cartItems.pull(item._id);
  calcTotalPrice(cart);
  applyDiscount(cart);
  await cart.save();

  res.status(200).json({ message: "success", data: cart });
});

export const updateProductQuantity = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  const item = findCartItem(cart, req.params.id);
  if (!item) return next(new AppError("Item not in cart", 404));

  item.quantity = req.body.quantity;
  calcTotalPrice(cart);
  applyDiscount(cart);
  await cart.save();

  res.status(200).json({ message: "success", data: cart });
});

export const applyCoupon = catchAsyncError(async (req, res, next) => {
  const coupon = await couponModel.findOne({
    code: req.body.code,
    expires: { $gt: Date.now() },
  });
  if (!coupon) return next(new AppError("Invalid or expired coupon", 400));

  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart || !cart.cartItems.length) {
    return next(new AppError("Cart not found or empty", 404));
  }

  cart.discount = coupon.discount;
  calcTotalPrice(cart);
  applyDiscount(cart);
  await cart.save();

  res.status(200).json({ message: "success", data: cart });
});

export const clearCart = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findOneAndDelete({ userId: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  res.status(200).json({ message: "success", data: null });
});

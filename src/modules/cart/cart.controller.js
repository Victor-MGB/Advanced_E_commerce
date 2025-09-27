import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { cartModel } from "../../../Database/models/cart.model.js";
import { productModel } from "../../../Database/models/product.model.js";
import { couponModel } from "../../../Database/models/coupon.model.js";

// Helper: calculate total cart price
function calcTotalPrice(cart) {
  cart.totalPrice = cart.cartItem.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
}

// Helper: apply discount if exists
function applyDiscount(cart) {
  if (cart?.discount) {
    cart.totalPriceAfterDiscount =
      cart.totalPrice - (cart.totalPrice * cart.discount) / 100;
  } else {
    cart.totalPriceAfterDiscount = undefined;
  }
}

/**
 * @desc    Add product to cart
 * @route   POST /api/v1/cart
 * @access  User
 */
export const addProductToCart = catchAsyncError(async (req, res, next) => {
  const product = await productModel.findById(req.body.productId).select("price");
  if (!product) return next(new AppError("Product not found", 404));

  req.body.price = product.price;

  let cart = await cartModel.findOne({ userId: req.user._id });

  if (!cart) {
    cart = new cartModel({
      userId: req.user._id,
      cartItem: [req.body],
    });
  } else {
    const existingItem = cart.cartItem.find(
      (item) => item.productId.toString() === req.body.productId
    );

    if (existingItem) {
      existingItem.quantity += req.body.quantity || 1;
    } else {
      cart.cartItem.push(req.body);
    }
  }

  calcTotalPrice(cart);
  applyDiscount(cart);

  await cart.save();

  res.status(201).json({ message: "success", data: cart });
});

/**
 * @desc    Remove product from cart
 * @route   DELETE /api/v1/cart/:id
 * @access  User
 */
export const removeProductFromCart = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { cartItem: { _id: req.params.id } } },
    { new: true }
  );

  if (!cart) return next(new AppError("Cart or item not found", 404));

  calcTotalPrice(cart);
  applyDiscount(cart);

  await cart.save();

  res.status(200).json({ message: "success", data: cart });
});

/**
 * @desc    Update product quantity in cart
 * @route   PATCH /api/v1/cart/:id
 * @access  User
 */
export const updateProductQuantity = catchAsyncError(async (req, res, next) => {
  const product = await productModel.findById(req.params.id);
  if (!product) return next(new AppError("Product not found", 404));

  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  const item = cart.cartItem.find(
    (elm) => elm.productId.toString() === req.params.id
  );
  if (!item) return next(new AppError("Item not in cart", 404));

  item.quantity = req.body.quantity;
  calcTotalPrice(cart);
  applyDiscount(cart);

  await cart.save();

  res.status(200).json({ message: "success", data: cart });
});

/**
 * @desc    Apply coupon to cart
 * @route   POST /api/v1/cart/apply-coupon
 * @access  User
 */
export const applyCoupon = catchAsyncError(async (req, res, next) => {
  const coupon = await couponModel.findOne({
    code: req.body.code,
    expires: { $gt: Date.now() },
  });

  if (!coupon) return next(new AppError("Invalid or expired coupon", 400));

  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  cart.discount = coupon.discount;
  calcTotalPrice(cart);
  applyDiscount(cart);

  await cart.save();

  res.status(200).json({ message: "success", data: cart });
});

/**
 * @desc    Get logged in user's cart
 * @route   GET /api/v1/cart
 * @access  User
 */
export const getLoggedUserCart = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel
    .findOne({ userId: req.user._id })
    .populate("cartItem.productId");

  if (!cart) return next(new AppError("Cart not found", 404));

  res.status(200).json({ message: "success", data: cart });
});

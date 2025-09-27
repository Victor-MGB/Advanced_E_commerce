import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { cartModel } from "../../../Database/models/cart.model.js";
import { orderModel } from "../../../Database/models/order.model.js";
import { productModel } from "../../../Database/models/product.model.js";
import { userModel } from "../../../Database/models/user.model.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =======================
// 📦 Create Cash Order
// =======================
export const createCashOrder = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new AppError("Cart not found", 404));

  const totalOrderPrice = cart.totalPriceAfterDiscount ?? cart.totalPrice;

  const order = await orderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });

  if (!order) return next(new AppError("Order not created", 500));

  // Update product stock & clear cart
  const bulkOps = cart.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
    },
  }));

  await productModel.bulkWrite(bulkOps);
  await cartModel.findByIdAndDelete(req.params.id);

  res.status(201).json({ message: "success", order });
});

// =======================
// 📦 Get Specific Order
// =======================
export const getSpecificOrder = catchAsyncError(async (req, res) => {
  const order = await orderModel
    .findOne({ user: req.user._id })
    .populate("cartItems.productId");

  if (!order) return res.status(404).json({ message: "Order not found" });

  res.status(200).json({ message: "success", order });
});

// =======================
// 📦 Get All Orders (Admin)
// =======================
export const getAllOrders = catchAsyncError(async (req, res) => {
  const orders = await orderModel
    .find()
    .populate("user")
    .populate("cartItems.productId");

  res.status(200).json({ message: "success", orders });
});

// =======================
// 💳 Stripe Checkout Session
// =======================
export const createCheckoutSession = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new AppError("Cart not found", 404));

  const totalOrderPrice = cart.totalPriceAfterDiscount ?? cart.totalPrice;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: totalOrderPrice * 100,
          product_data: { name: `Order for ${req.user.name}` },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/orders/success`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    metadata: req.body.shippingAddress,
  });

  res.status(200).json({ message: "success", session });
});

// =======================
// 💳 Stripe Webhook (Card Payments)
// =======================
export const handleStripeWebhook = catchAsyncError(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEBHOOK_API
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    await createCardOrder(event.data.object);
    return res.status(200).json({ received: true });
  }

  console.log(`Unhandled event type: ${event.type}`);
  res.status(400).end();
});

// =======================
// 💳 Create Order from Stripe Event
// =======================
async function createCardOrder(session) {
  const cart = await cartModel.findById(session.client_reference_id);
  if (!cart) throw new AppError("Cart not found", 404);

  const user = await userModel.findOne({ email: session.customer_email });
  if (!user) throw new AppError("User not found", 404);

  const order = await orderModel.create({
    user: user._id,
    cartItems: cart.cartItems,
    totalOrderPrice: session.amount_total / 100,
    shippingAddress: session.metadata,
    paymentMethod: "card",
    isPaid: true,
    paidAt: Date.now(),
  });

  // Update stock
  const bulkOps = cart.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
    },
  }));

  await productModel.bulkWrite(bulkOps);

  // Clear cart
  await cartModel.findByIdAndDelete(cart._id);

  return order;
}
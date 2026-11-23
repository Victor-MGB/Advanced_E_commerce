import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { cartModel } from "../../../Database/models/cart.model.js";
import { orderModel } from "../../../Database/models/order.model.js";
import { productModel } from "../../../Database/models/product.model.js";
import { userModel } from "../../../Database/models/user.model.js";
import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const getPaystackSecret = () => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new AppError("Paystack is not configured", 500);
  }
  return process.env.PAYSTACK_SECRET_KEY;
};

const getPaystackCurrency = () => (process.env.PAYSTACK_CURRENCY || "USD").toUpperCase();

const paystackRequest = async (path, { method = "GET", body } = {}) => {
  let response;
  try {
    response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${getPaystackSecret()}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new AppError("Could not reach Paystack. Please try again.", 502);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status === false) {
    throw new AppError(payload.message || "Paystack request failed", 502);
  }
  return payload.data;
};

const parseMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === "object") return metadata;
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
};

const signaturesMatch = (expected, actual) => {
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  return (
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  );
};

const verifyPaystackSignature = (rawBody, headers) => {
  const modernSignature = headers["paystack-signature"];
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
  const hasWebhookSecret = Boolean(
    webhookSecret && !/replace[_-]?me/i.test(webhookSecret)
  );

  if (modernSignature && hasWebhookSecret) {
    const parts = String(modernSignature).split(",");
    const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
    const signatures = parts
      .filter((part) => part.startsWith("v1="))
      .map((part) => part.slice(3).split(":").pop())
      .filter(Boolean);

    if (!timestamp || !signatures.length) {
      throw new AppError("Paystack signature is invalid", 400);
    }
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
      throw new AppError("Paystack signature has expired", 400);
    }

    const expected = crypto
      .createHmac("sha512", webhookSecret)
      .update(`${timestamp}.`)
      .update(rawBody)
      .digest("hex");

    if (
      !signatures.some(
        (signature) =>
          /^[0-9a-f]{128}$/i.test(signature) && signaturesMatch(expected, signature)
      )
    ) {
      throw new AppError("Paystack signature is invalid", 400);
    }
    return;
  }

  const legacySignature = headers["x-paystack-signature"];
  if (legacySignature) {
    const expected = crypto
      .createHmac("sha512", getPaystackSecret())
      .update(rawBody)
      .digest("hex");

    if (
      !/^[0-9a-f]{128}$/i.test(String(legacySignature)) ||
      !signaturesMatch(expected, String(legacySignature))
    ) {
      throw new AppError("Paystack signature is invalid", 400);
    }
    return;
  }

  if (modernSignature) {
    throw new AppError(
      "Paystack webhook secret is not configured. Set PAYSTACK_WEBHOOK_SECRET to verify Paystack-Signature events.",
      500
    );
  }

  throw new AppError("Paystack signature is missing", 400);
};

const getCartTotal = (cart) => (cart.totalPriceAfterDiscount ?? cart.totalPrice) || 0;

const checkStock = async (cartItems) => {
  const products = await productModel.find({
    _id: { $in: cartItems.map((item) => item.productId) },
  });

  for (const item of cartItems) {
    const product = products.find(
      (candidate) => candidate._id.toString() === item.productId.toString()
    );
    if (!product || product.quantity < item.quantity) {
      throw new AppError(`Insufficient stock for ${product?.title || "a product"}`, 400);
    }
  }
};

const reduceStock = async (cartItems) => {
  await productModel.bulkWrite(
    cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }))
  );
};

export const createCashOrder = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!cart) return next(new AppError("Cart not found", 404));
  if (!cart.cartItems.length) return next(new AppError("Cart is empty", 400));

  const { shippingAddress } = req.body;
  if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.phone) {
    return next(new AppError("shippingAddress (street, city, phone) is required", 400));
  }

  await checkStock(cart.cartItems);

  const order = await orderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice: getCartTotal(cart),
    shippingAddress,
    paymentMethod: "cash",
  });

  await reduceStock(cart.cartItems);
  await cartModel.findByIdAndDelete(cart._id);

  res.status(201).json({ message: "success", data: order });
});

export const getSpecificOrder = catchAsyncError(async (req, res) => {
  const orders = await orderModel
    .find({ user: req.user._id })
    .populate("cartItems.productId")
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: "success",
    results: orders.length,
    data: orders,
  });
});

export const getAllOrders = catchAsyncError(async (req, res) => {
  const orders = await orderModel
    .find()
    .populate("user", "name email")
    .populate("cartItems.productId")
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: "success",
    results: orders.length,
    data: orders,
  });
});

export const initializePayment = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!cart) return next(new AppError("Cart not found", 404));
  if (!cart.cartItems.length) return next(new AppError("Cart is empty", 400));

  const { shippingAddress } = req.body;
  if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.phone) {
    return next(new AppError("shippingAddress (street, city, phone) is required", 400));
  }

  await checkStock(cart.cartItems);

  const amount = Math.round(getCartTotal(cart) * 100);
  if (!amount) return next(new AppError("Cart total is invalid", 400));

  const frontendUrl = (process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`)
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");
  const reference = `cart-${cart._id}-${Date.now()}`;
  const payment = await paystackRequest("/transaction/initialize", {
    method: "POST",
    body: {
      email: req.user.email,
      amount,
      currency: getPaystackCurrency(),
      reference,
      callback_url: `${frontendUrl}/checkout/success`,
      metadata: JSON.stringify({
        cartId: cart._id.toString(),
        userId: req.user._id.toString(),
        street: String(shippingAddress.street),
        city: String(shippingAddress.city),
        phone: String(shippingAddress.phone),
      }),
    },
  });

  res.status(200).json({
    message: "success",
    data: { url: payment.authorization_url, reference: payment.reference },
  });
});

export const handlePaystackWebhook = catchAsyncError(async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(JSON.stringify(req.body || {}));

  verifyPaystackSignature(rawBody, req.headers);

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new AppError("Webhook payload is invalid", 400);
  }

  if (event.event === "charge.success") {
    await createCardOrder(event.data);
  }

  res.status(200).json({ received: true });
});

export const verifyPayment = catchAsyncError(async (req, res, next) => {
  const { reference } = req.params;
  const existing = await orderModel.findOne({
    paymentReference: reference,
    user: req.user._id,
  });
  if (existing) {
    return res.status(200).json({ message: "success", data: existing });
  }

  const payment = await paystackRequest(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
  if (payment.status !== "success") {
    return next(new AppError("Payment has not been completed", 400));
  }

  const order = await createCardOrder(payment, req.user._id);
  res.status(200).json({ message: "success", data: order });
});

async function createCardOrder(payment, ownerId = null) {
  const reference = payment.reference;
  const existing = await orderModel.findOne({ paymentReference: reference });
  if (existing) return existing;

  if (payment.status !== "success") {
    throw new AppError("Payment has not been completed", 400);
  }

  const metadata = parseMetadata(payment.metadata);
  const cartId =
    metadata.cartId ||
    String(reference).match(/^cart-([a-f0-9]{24})-/i)?.[1];
  if (!cartId) throw new AppError("Payment metadata is missing the cart", 400);

  const cart = await cartModel.findOne(
    ownerId ? { _id: cartId, userId: ownerId } : { _id: cartId }
  );
  if (!cart) throw new AppError("Cart not found", 404);
  if (!cart.cartItems.length) throw new AppError("Cart is empty", 400);

  const expectedAmount = Math.round(getCartTotal(cart) * 100);
  if (Number(payment.amount) !== expectedAmount) {
    throw new AppError("Payment amount does not match the cart total", 400);
  }

  const currency = String(payment.currency || getPaystackCurrency()).toUpperCase();
  if (currency !== getPaystackCurrency()) {
    throw new AppError("Payment currency does not match the store currency", 400);
  }

  const user = await userModel.findById(metadata.userId || cart.userId);
  if (!user) throw new AppError("User not found", 404);

  await checkStock(cart.cartItems);

  let order;
  try {
    order = await orderModel.create({
      user: user._id,
      cartItems: cart.cartItems,
      totalOrderPrice: Number(payment.amount) / 100,
      shippingAddress: {
        street: metadata.street || "N/A",
        city: metadata.city || "N/A",
        phone: metadata.phone || "N/A",
      },
      paymentMethod: "card",
      isPaid: true,
      paidAt: payment.paid_at ? new Date(payment.paid_at) : Date.now(),
      paymentReference: reference,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return orderModel.findOne({ paymentReference: reference });
    }
    throw error;
  }

  await reduceStock(cart.cartItems);
  await cartModel.findByIdAndDelete(cart._id);

  return order;
}

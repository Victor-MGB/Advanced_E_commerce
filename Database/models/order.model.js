import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: "user",
      required: true,
    },
    cartItems: [
      {
        productId: { type: Schema.ObjectId, ref: "product", required: true },
        quantity: { type: Number, default: 1, min: 1 },
        price: Number,
        totalProductDiscount: Number,
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
    },
    totalOrderPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    deliveredAt: Date,
    paymentReference: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export const orderModel = model("order", orderSchema);

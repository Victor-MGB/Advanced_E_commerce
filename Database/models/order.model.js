import {Schema, model} from "mongoose";

const orderSchema = new Schema(
    {
        userId: {
            type: Schema.ObjectId,
            required: true,
            ref: "user",
        },
        cartItems: [
            {
                productId: {type:Schema.ObjectId, ref: "product"},
                quantity: {
                    type: Number,
                    default: 1
                },
                price: Number,
                totalProductDiscount: Number,
            }
        ],
        shipping: {
            street: String,
            city: String,
            phone: Number,
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card'],
            default: 'cash',
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
    }
)

export const orderModel = model("order", orderSchema);
import {Schema, model} from "mongoose";

const reviewSchema = new Schema(
    {
        comment: {
            type: String,
            trim: true,
            required: true,
        },
        productId: {
            type: Schema.ObjectId,
            ref: "product",
            required: true,
        },
        userId: {
            type: Schema.ObjectId,
            ref: "user",
            required: true,
        },
        rating: {
            type: Number,
            default: 1,
            min: 1,
            max: 5,
        },
    },
    {timestamps: true}
);

reviewSchema.pre(['find','findOne'],function (){
  this.populate('userId','name -_id')
})

export const reviewModel = model("review", reviewSchema);
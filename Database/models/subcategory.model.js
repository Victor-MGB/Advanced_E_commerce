import {Schema, model} from "mongoose";

const subCategory = new Schema(
    {
        name:{
            type: String,
            required: true,
            minLength: [2, "Too short subcategory name"],
            unique: true,
            trim: true,
        },

        slug: {
            type: String,
            lowercase: true,
        },
        category: {
            type: Schema.ObjectId,
            required: true,
            ref: "category",
        },
    },
    {timestamps: true}
);

export const subCategoryModel = model("subcategory", subCategory);